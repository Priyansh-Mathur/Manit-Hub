const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Question = require("../models/Question");
const { AUTHOR_FIELDS, withMyUpvote } = require("./helpers");

/**
 * GET /api/forum/questions
 */
router.get("/questions", auth, async (req, res, next) => {
  try {
    const {
      search,
      branch,
      subject,
      semester,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const safeLimit = Math.min(Number(limit), 30);
    const skip = (Number(page) - 1) * safeLimit;

    const query = {
      university: req.user.university,
      isActive: true,
    };

    if (branch && branch !== "All") query.branch = branch;
    if (semester && semester !== "All") query.semester = semester;
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (sort === "unanswered") query.answersCount = 0;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      top: { upvoteCount: -1, createdAt: -1 },
      unanswered: { createdAt: -1 },
    };

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate("author", AUTHOR_FIELDS)
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      Question.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: questions.map((q) => withMyUpvote(q, req.user._id)),
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
