const Conversation = require("../models/Conversation");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Message = require("../models/Message");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");

/**
 * GET /api/conversations
 */
exports.getUserConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      university: req.user.university,
    })
      .populate("participants", "displayName avatarUrl")
      .sort({ lastMessageAt: -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user._id },
          readAt: null,
        });
        const data = conversation.toObject();
        data.unreadCount = unreadCount;
        return data;
      })
    );

    return success(res, conversationsWithUnread);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/conversations
 */
// Context loaders per conversation type. Each returns the source document;
// all of them carry { title, university, isActive } so the checks below are shared.
const contextLoaders = {
  listing: { model: () => Listing, titlePrefix: "", notifType: "marketplace" },
  lostfound: {
    model: () => require("../models/LostFoundItem"),
    titlePrefix: "Lost & Found: ",
    notifType: "system",
  },
  ride: {
    model: () => require("../models/Ride"),
    titlePrefix: "Ride: ",
    notifType: "system",
  },
};

exports.createConversation = async (req, res, next) => {
  try {
    const { listingId, participantId, contextType = "listing" } = req.body;

    // Direct friend DM — no listing context; gated to accepted friends.
    if (contextType === "friend") {
      return startFriendConversation(req, res, next, participantId);
    }

    if (!listingId || !participantId) {
      return error(res, "Missing required fields", 400);
    }

    const loader = contextLoaders[contextType];
    if (!loader) {
      return error(res, "Invalid conversation context", 400);
    }

    if (participantId === req.user._id.toString()) {
      return error(res, "Cannot start conversation with yourself", 400);
    }

    // 🔍 Load the context document (listing / lost & found item / ride)
    const listing = await loader.model().findById(listingId);
    if (!listing || listing.isActive === false) {
      return error(res, "Listing not found", 404);
    }

    // 🔒 University check
    if (listing.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    // 🔍 Load other user
    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return error(res, "User not found", 404);
    }

    if (
      otherUser.university.toString() !== req.user.university.toString()
    ) {
      return error(res, "Cross-university conversation not allowed", 403);
    }

    const participants = [req.user._id, otherUser._id]
      .map(String)
      .sort();

    let conversation = await Conversation.findOne({
      listingId,
      participants,
      university: req.user.university,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingId,
        contextType,
        listingTitle: `${loader.titlePrefix}${listing.title}`, // 🔒 derived, not trusted
        participants,
        university: req.user.university,
      });

      // Notify the other participant that someone started a chat.
      await createNotification(
        otherUser._id,
        loader.notifType,
        `New chat about “${listing.title}”`,
        contextType === "listing"
          ? `${req.user.displayName} is interested in your listing.`
          : `${req.user.displayName} wants to talk about “${listing.title}”.`,
        contextType === "listing" ? listing._id : null,
        contextType === "listing" ? "Listing" : null
      );
    }

    return success(res, conversation, "Conversation ready", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Find-or-create a direct friend DM. Requires an accepted friendship and
 * reuses the same Socket.IO chat (participants + university only).
 */
async function startFriendConversation(req, res, next, participantId) {
  try {
    if (!participantId) {
      return error(res, "Missing participant", 400);
    }
    if (participantId === req.user._id.toString()) {
      return error(res, "Cannot message yourself", 400);
    }

    const otherUser = await User.findById(participantId);
    if (!otherUser || !otherUser.isActive) {
      return error(res, "User not found", 404);
    }
    if (otherUser.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    // 🔒 Must be accepted friends.
    const Friendship = require("../models/Friendship");
    const users = [req.user._id.toString(), otherUser._id.toString()].sort();
    const friendship = await Friendship.findOne({ users, status: "accepted" });
    if (!friendship) {
      return error(res, "You can only message your friends directly", 403);
    }

    const participants = users;
    let conversation = await Conversation.findOne({
      contextType: "friend",
      participants,
      university: req.user.university,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingId: null,
        contextType: "friend",
        listingTitle: "",
        participants,
        university: req.user.university,
      });
    }

    return success(res, conversation, "Conversation ready", 201);
  } catch (err) {
    next(err);
  }
}
