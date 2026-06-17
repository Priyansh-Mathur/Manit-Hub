const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Question = require("../models/Question");
const { success, error } = require("../utils/response");
const { awardPoints } = require("../utils/gamification");
const { AUTHOR_FIELDS, withMyUpvote } = require("./helpers");

/**
 * POST /api/forum/questions
 */
router.post("/questions", auth, async (req, res, next) => {
  try {
    const { title, body, branch, subject, semester } = req.body;

    if (!title || !title.trim()) {
      return error(res, "Question title is required", 400);
    }

    const question = await Question.create({
      title: title.trim(),
      body,
      branch,
      subject,
      semester,
      author: req.user._id,
      university: req.user.university,
    });
    await question.populate("author", AUTHOR_FIELDS);

    await awardPoints(req.user._id, "question_posted");

    return success(res, withMyUpvote(question, req.user._id), "Question posted", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
