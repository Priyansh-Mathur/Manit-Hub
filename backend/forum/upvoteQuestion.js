const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Question = require("../models/Question");
const { success, error } = require("../utils/response");

/**
 * POST /api/forum/questions/:id/upvote
 */
router.post("/questions/:id/upvote", auth, universityScope(Question), async (req, res, next) => {
  try {
    const question = req.resource;
    if (!question.isActive) return error(res, "Question not found", 404);

    const viewer = req.user._id.toString();
    const has = question.upvotes.some((u) => u.toString() === viewer);
    question.upvotes = has
      ? question.upvotes.filter((u) => u.toString() !== viewer)
      : [...question.upvotes, req.user._id];
    question.upvoteCount = question.upvotes.length;
    await question.save();

    return success(res, { upvoteCount: question.upvoteCount, myUpvote: !has });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
