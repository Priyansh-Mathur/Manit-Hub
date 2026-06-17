const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");
const { awardPoints } = require("../utils/gamification");

const AUTHOR_FIELDS = "displayName avatarUrl";

const withMyUpvote = (doc, viewerId) => {
  const data = doc.toObject();
  data.myUpvote = doc.upvotes.some(
    (u) => u.toString() === viewerId.toString()
  );
  delete data.upvotes;
  return data;
};

/**
 * GET /api/forum/questions
 */
exports.getQuestions = async (req, res, next) => {
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
};

/**
 * POST /api/forum/questions
 */
exports.createQuestion = async (req, res, next) => {
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
};

/**
 * GET /api/forum/questions/:id — question + answers.
 */
exports.getQuestion = async (req, res, next) => {
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
};

/**
 * POST /api/forum/questions/:id/upvote
 */
exports.upvoteQuestion = async (req, res, next) => {
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
};

/**
 * DELETE /api/forum/questions/:id  (author only)
 */
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = req.resource;

    if (
      !question.isActive ||
      question.author.toString() !== req.user._id.toString()
    ) {
      return error(res, "Question not found or not authorized", 404);
    }

    question.isActive = false;
    await question.save();

    return success(res, null, "Question deleted");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/forum/questions/:id/answers
 */
exports.addAnswer = async (req, res, next) => {
  try {
    const question = req.resource;
    if (!question.isActive) return error(res, "Question not found", 404);

    const { body } = req.body;
    if (!body || !body.trim()) {
      return error(res, "Answer can't be empty", 400);
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
};

/**
 * POST /api/forum/answers/:id/upvote
 */
exports.upvoteAnswer = async (req, res, next) => {
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
};

/**
 * POST /api/forum/answers/:id/accept  (question author only; toggles)
 */
exports.acceptAnswer = async (req, res, next) => {
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
};

/**
 * DELETE /api/forum/answers/:id  (author only)
 */
exports.deleteAnswer = async (req, res, next) => {
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
};
