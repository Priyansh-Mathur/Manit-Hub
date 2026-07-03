const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { success, error } = require("../utils/response");

/**
 * POST /api/messages/:conversationId
 * Persist + deliver a message over REST so chat works even with no live socket
 * (e.g. the serverless deploy). When a Socket.IO server is attached, it also
 * pushes the message to other open clients in real time; otherwise receivers
 * pick it up by polling. Mirrors the Socket.IO `send_message` handler.
 */
router.post("/:conversationId", auth, universityScope(Conversation, "conversationId"), async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const content = String(req.body?.content || "").trim();
    if (!content) {
      return error(res, "Message content is required", 400);
    }
    if (content.length > 2000) {
      return error(res, "Message is too long (max 2000 characters)", 400);
    }

    const conversation = req.resource; // loaded + university-scoped by middleware
    if (!conversation) {
      return error(res, "Conversation not found", 404);
    }

    const isParticipant = conversation.participants
      .map(String)
      .includes(req.user._id.toString());
    if (!isParticipant) {
      return error(res, "Not authorized", 403);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      university: req.user.university,
      content,
    });

    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Real-time fan-out when a Socket.IO server is attached (local dev or a
    // persistent host). On serverless there is no `io`, so this is skipped and
    // recipients receive the message via polling instead.
    const io = req.app.get("io");
    if (io) {
      io.to(String(conversationId)).emit("receive_message", message);
    }

    // One coalesced unread notification per conversation for each recipient.
    try {
      const recipients = conversation.participants
        .map((p) => p.toString())
        .filter((pid) => pid !== req.user._id.toString());
      const snippet = content.length > 80 ? `${content.slice(0, 77)}…` : content;
      await Promise.all(
        recipients.map((rid) =>
          Notification.findOneAndUpdate(
            { user: rid, type: "message", relatedId: conversationId, read: false },
            {
              user: rid,
              type: "message",
              title: `New message from ${req.user.displayName}`,
              description: snippet,
              relatedId: conversationId,
              relatedModel: "Conversation",
              read: false,
            },
            { upsert: true, setDefaultsOnInsert: true }
          )
        )
      );
    } catch (e) {
      console.error("notification (message) failed:", e.message);
    }

    return success(res, message, "Message sent", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
