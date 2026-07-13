const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Document = require("../../models/Document");
const { success, error } = require("../../utils/response");

/**
 * POST /api/documents/:id/upvote — toggle the viewer's upvote.
 */
router.post("/:id/upvote", auth, universityScope(Document), async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    const viewer = req.user._id.toString();
    const hasUpvoted = document.upvotes.some((u) => u.toString() === viewer);

    if (hasUpvoted) {
      document.upvotes = document.upvotes.filter(
        (u) => u.toString() !== viewer
      );
    } else {
      document.upvotes.push(req.user._id);
    }
    document.upvoteCount = document.upvotes.length;
    await document.save();

    return success(res, {
      upvoteCount: document.upvoteCount,
      myUpvote: !hasUpvoted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
