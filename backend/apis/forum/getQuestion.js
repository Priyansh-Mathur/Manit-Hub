const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const { success, error } = require("../../utils/response");
const { AUTHOR_FIELDS, withMyUpvote } = require("./helpers");

/**
 * GET /api/forum/questions/:id — question + answers.
 */
router.get("/questions/:id", auth, universityScope(Question), async (req, res, next) => {
  try {
    const question = req.resource;
    if (!question.isActive) return error(res, "Question not found", 404);

    await question.populate("author", AUTHOR_FIELDS);
    const answers = await Answer.find({
      question: question._id,
      isActive: true,
    })
      .populate("author", AUTHOR_FIELDS)
      .sort({ upvoteCount: -1, createdAt: 1 });

    const acceptedId = question.acceptedAnswer?.toString();
    const serialized = answers
      .map((a) => ({
        ...withMyUpvote(a, req.user._id),
        isAccepted: a._id.toString() === acceptedId,
      }))
      // accepted answer floats to the top
      .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0));

    return success(res, {
      question: withMyUpvote(question, req.user._id),
      answers: serialized,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
