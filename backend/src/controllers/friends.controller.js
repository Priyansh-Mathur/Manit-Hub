const mongoose = require("mongoose");
const Friendship = require("../models/Friendship");
const User = require("../models/User");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");
const presence = require("../socket/presence");

const PUBLIC_FIELDS = "displayName handle avatarUrl";

const sortedPair = (a, b) => [a.toString(), b.toString()].sort();

/**
 * GET /api/friends — accepted friends, annotated with live online status.
 */
exports.getFriends = async (req, res, next) => {
  try {
    const links = await Friendship.find({
      users: req.user._id,
      status: "accepted",
    })
      .populate("requester", `${PUBLIC_FIELDS} privacySettings.showOnlineStatus`)
      .populate("recipient", `${PUBLIC_FIELDS} privacySettings.showOnlineStatus`)
      .sort({ updatedAt: -1 });

    const me = req.user._id.toString();
    const friends = links.map((link) => {
      const other =
        link.requester._id.toString() === me ? link.recipient : link.requester;
      // Respect the friend's own "show online status" privacy choice.
      const shows = other.privacySettings?.showOnlineStatus !== false;
      return {
        _id: other._id,
        displayName: other.displayName,
        handle: other.handle,
        avatarUrl: other.avatarUrl,
        isOnline: shows && presence.isOnline(other._id),
        since: link.updatedAt,
      };
    });

    return success(res, friends);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id/friends — another user's friends list (profile view).
 * Mounted in users.routes with universityScope(User), so req.resource is the
 * profile owner. Private profiles only reveal the list to themselves and
 * their own friends; everyone still sees the count.
 */
exports.getFriendsOf = async (req, res, next) => {
  try {
    const owner = req.resource;
    const viewer = req.user._id.toString();
    const isSelf = owner._id.toString() === viewer;

    const links = await Friendship.find({
      users: owner._id,
      status: "accepted",
    })
      .populate("requester", PUBLIC_FIELDS)
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ updatedAt: -1 });

    const friends = links.map((link) => {
      const other =
        link.requester._id.toString() === owner._id.toString()
          ? link.recipient
          : link.requester;
      return {
        _id: other._id,
        displayName: other.displayName,
        handle: other.handle,
        avatarUrl: other.avatarUrl,
      };
    });

    const viewerIsFriend = friends.some((f) => f._id.toString() === viewer);
    const isPrivate = owner.privacySettings?.profileVisibility === "private";
    const hidden = isPrivate && !isSelf && !viewerIsFriend;

    return success(res, {
      count: friends.length,
      hidden,
      friends: hidden ? [] : friends,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends/requests — { incoming, outgoing } pending requests.
 */
exports.getRequests = async (req, res, next) => {
  try {
    const pending = await Friendship.find({
      users: req.user._id,
      status: "pending",
    })
      .populate("requester", PUBLIC_FIELDS)
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    const me = req.user._id.toString();
    const incoming = [];
    const outgoing = [];

    for (const link of pending) {
      if (link.requester._id.toString() === me) {
        outgoing.push({
          _id: link.recipient._id,
          displayName: link.recipient.displayName,
          handle: link.recipient.handle,
          avatarUrl: link.recipient.avatarUrl,
          requestedAt: link.createdAt,
        });
      } else {
        incoming.push({
          _id: link.requester._id,
          displayName: link.requester.displayName,
          handle: link.requester.handle,
          avatarUrl: link.requester.avatarUrl,
          requestedAt: link.createdAt,
        });
      }
    }

    return success(res, { incoming, outgoing });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/friends/requests/:userId — send a friend request.
 */
exports.sendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return error(res, "Invalid user", 400);
    }
    if (userId === req.user._id.toString()) {
      return error(res, "You can't friend yourself", 400);
    }

    const other = await User.findById(userId);
    if (!other || !other.isActive) {
      return error(res, "User not found", 404);
    }
    if (other.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    const users = sortedPair(req.user._id, other._id);
    const existing = await Friendship.findOne({ users });
    if (existing) {
      return error(
        res,
        existing.status === "accepted"
          ? "You're already friends"
          : "A request is already pending",
        400
      );
    }

    await Friendship.create({
      requester: req.user._id,
      recipient: other._id,
      users,
      status: "pending",
      university: req.user.university,
    });

    await createNotification(
      other._id,
      "friend",
      "New friend request",
      `${req.user.displayName} (@${req.user.handle}) sent you a friend request.`,
      req.user._id,
      "User"
    );

    return success(res, null, "Friend request sent", 201);
  } catch (err) {
    // Unique-index race → treat as already-exists.
    if (err.code === 11000) {
      return error(res, "A request already exists", 400);
    }
    next(err);
  }
};

/**
 * PATCH /api/friends/requests/:userId/accept — accept an incoming request.
 */
exports.acceptRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOne({ users, status: "pending" });
    if (!link || link.recipient.toString() !== req.user._id.toString()) {
      return error(res, "No pending request from this user", 404);
    }

    link.status = "accepted";
    await link.save();

    await createNotification(
      link.requester,
      "friend",
      "Friend request accepted",
      `${req.user.displayName} (@${req.user.handle}) accepted your friend request.`,
      req.user._id,
      "User"
    );

    return success(res, null, "You're now friends");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/friends/requests/:userId — decline incoming OR cancel outgoing.
 */
exports.removeRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOneAndDelete({ users, status: "pending" });
    if (!link) {
      return error(res, "No pending request", 404);
    }

    return success(res, null, "Request removed");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/friends/:userId — unfriend.
 */
exports.unfriend = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOneAndDelete({ users, status: "accepted" });
    if (!link) {
      return error(res, "You're not friends with this user", 404);
    }

    return success(res, null, "Removed from friends");
  } catch (err) {
    next(err);
  }
};
