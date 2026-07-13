const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Document = require("../../models/Document");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");

/**
 * POST /api/documents/:id/comments
 */
router.post("/:id/comments", auth, universityScope(Document), async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return error(res, "Comment can't be empty", 400);
    }
    if (content.trim().length > 500) {
      return error(res, "Keep comments under 500 characters", 400);
    }

    document.comments.push({
      author: req.user._id,
      content: content.trim(),
    });
    await document.save();
    await document.populate("comments.author", "displayName avatarUrl");

    if (document.uploader.toString() !== req.user._id.toString()) {
      await createNotification(
        document.uploader,
        "system",
        `New comment on “${document.title}”`,
        `${req.user.displayName} commented on your document.`,
        null,
        null
      );
    }

    return success(
      res,
      document.comments[document.comments.length - 1],
      "Comment posted",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
