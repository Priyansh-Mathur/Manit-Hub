const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { success, error } = require("../../utils/response");

/**
 * GET /api/messages/:conversationId
 */
router.get("/:conversationId", auth, universityScope(Conversation, "conversationId"), async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const safeLimit = Math.min(Number(limit), 100);

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

    const skip = (Number(page) - 1) * safeLimit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    return success(res, {
      messages: messages.reverse(),
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
