const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Answer = require("../../models/Answer");
const Question = require("../../models/Question");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/forum/answers/:id  (author only)
 */
router.delete("/answers/:id", auth, universityScope(Answer), async (req, res, next) => {
  try {
    const answer = req.resource;

    if (
      !answer.isActive ||
      answer.author.toString() !== req.user._id.toString()
    ) {
      return error(res, "Answer not found or not authorized", 404);
    }

    answer.isActive = false;
    await answer.save();

    const question = await Question.findById(answer.question);
    if (question) {
      question.answersCount = Math.max(0, question.answersCount - 1);
      if (question.acceptedAnswer?.toString() === answer._id.toString()) {
        question.acceptedAnswer = null;
      }
      await question.save();
    }

    return success(res, null, "Answer deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
