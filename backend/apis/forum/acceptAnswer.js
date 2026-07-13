const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Answer = require("../../models/Answer");
const Question = require("../../models/Question");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");
const { awardPoints } = require("../../utils/gamification");

/**
 * POST /api/forum/answers/:id/accept  (question author only; toggles)
 */
router.post("/answers/:id/accept", auth, universityScope(Answer), async (req, res, next) => {
  try {
    const answer = req.resource;
    if (!answer.isActive) return error(res, "Answer not found", 404);

    const question = await Question.findById(answer.question);
    if (!question || !question.isActive) {
      return error(res, "Question not found", 404);
    }
    if (question.author.toString() !== req.user._id.toString()) {
      return error(res, "Only the question author can accept an answer", 403);
    }

    const alreadyAccepted =
      question.acceptedAnswer?.toString() === answer._id.toString();
    question.acceptedAnswer = alreadyAccepted ? null : answer._id;
    await question.save();

    if (!alreadyAccepted) {
      await awardPoints(answer.author, "answer_accepted");
    }

    if (!alreadyAccepted && answer.author.toString() !== req.user._id.toString()) {
      await createNotification(
        answer.author,
        "system",
        "Your answer was accepted ✅",
        `Your answer to “${question.title}” was marked as the solution.`,
        null,
        null
      );
    }

    return success(
      res,
      { acceptedAnswer: question.acceptedAnswer },
      alreadyAccepted ? "Acceptance removed" : "Answer accepted"
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
