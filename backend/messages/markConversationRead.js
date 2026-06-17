const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { success, error } = require("../utils/response");

/**
 * PUT /api/messages/:conversationId/read
 */
router.put("/:conversationId/read", auth, universityScope(Conversation, "conversationId"), async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = req.resource;

    if (!conversation) {
      return error(res, "Conversation not found", 404);
    }

    const isParticipant = conversation.participants
      .map(String)
      .includes(req.user._id.toString());

    if (!isParticipant) {
      return error(res, "Not authorized", 403);
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readAt: null,
      },
      { readAt: new Date() }
    );

    return success(res, null, "Messages marked as read");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
