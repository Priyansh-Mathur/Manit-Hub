const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const { awardPoints } = require("../utils/gamification");
const { isClean } = require("../utils/contentFilter");
const { AUTHOR_FIELDS, withMyUpvote } = require("./helpers");

/**
 * POST /api/forum/questions/:id/answers
 */
router.post("/questions/:id/answers", auth, universityScope(Question), async (req, res, next) => {
  try {
    const question = req.resource;
    if (!question.isActive) return error(res, "Question not found", 404);

    const { body } = req.body;
    if (!body || !body.trim()) {
      return error(res, "Answer can't be empty", 400);
    }
    if (!isClean(body)) {
      return error(res, "Your answer contains language that isn't allowed", 400);
    }

    const answer = await Answer.create({
      question: question._id,
      body: body.trim(),
      author: req.user._id,
      university: req.user.university,
    });
    await answer.populate("author", AUTHOR_FIELDS);

    question.answersCount += 1;
    await question.save();

    if (question.author.toString() !== req.user._id.toString()) {
      await createNotification(
        question.author,
        "system",
        "New answer to your question",
        `${req.user.displayName} answered “${question.title}”.`,
        null,
        null
      );
    }

    await awardPoints(req.user._id, "answer_posted");

    return success(
      res,
      { ...withMyUpvote(answer, req.user._id), isAccepted: false },
      "Answer posted",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
