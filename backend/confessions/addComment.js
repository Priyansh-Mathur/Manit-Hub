const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Confession = require("../models/Confession");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const serializeConfession = require("./serializeConfession");

/**
 * POST /api/confessions/:id/comments  { content }
 */
router.post("/:id/comments", auth, universityScope(Confession), async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive || confession.isHidden) {
      return error(res, "Confession not found", 404);
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return error(res, "Comment can't be empty", 400);
    }
    if (content.trim().length > 500) {
      return error(res, "Keep comments under 500 characters", 400);
    }

    confession.comments.push({
      author: req.user._id,
      content: content.trim(),
    });
    await confession.save();

    // Let the OP know — without revealing who replied.
    if (confession.author.toString() !== req.user._id.toString()) {
      await createNotification(
        confession.author,
        "system",
        "New reply to your confession",
        "Someone replied to your anonymous confession.",
        null,
        null
      );
    }

    return success(
      res,
      serializeConfession(confession, req.user._id),
      "Reply posted",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
