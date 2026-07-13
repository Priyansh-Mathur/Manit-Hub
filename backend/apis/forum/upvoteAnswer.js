const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Answer = require("../../models/Answer");
const { success, error } = require("../../utils/response");

/**
 * POST /api/forum/answers/:id/upvote
 */
router.post("/answers/:id/upvote", auth, universityScope(Answer), async (req, res, next) => {
  try {
    const answer = req.resource;
    if (!answer.isActive) return error(res, "Answer not found", 404);

    const viewer = req.user._id.toString();
    const has = answer.upvotes.some((u) => u.toString() === viewer);
    answer.upvotes = has
      ? answer.upvotes.filter((u) => u.toString() !== viewer)
      : [...answer.upvotes, req.user._id];
    answer.upvoteCount = answer.upvotes.length;
    await answer.save();

    return success(res, { upvoteCount: answer.upvoteCount, myUpvote: !has });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
