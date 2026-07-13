const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { success } = require("../../utils/response");

/**
 * GET /api/conversations
 */
router.get("/", auth, async (req, res, next) => {
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
});

module.exports = router;
