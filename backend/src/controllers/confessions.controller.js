const crypto = require("crypto");
const Confession = require("../models/Confession");
const { REACTION_TYPES } = require("../models/Confession");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");

const REPORT_AUTO_HIDE_THRESHOLD = 5;

// Deterministic anonymous handle per (confession, user) — stable inside a
// thread, different across confessions, and never reversible to the user.
const anonHandle = (confessionId, userId) =>
  "Anon-" +
  crypto
    .createHash("sha1")
    .update(`${confessionId}:${userId}:manit-hub-anon`)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

/**
 * Map a confession doc to its public (anonymized) shape.
 * The author and per-user identities never leave the server.
 */
const serializeConfession = (confession, viewerId) => {
  const viewer = viewerId.toString();
  const authorId = confession.author.toString();

  const reactionCounts = Object.fromEntries(
    REACTION_TYPES.map((type) => [type, 0])
  );
  let myReaction = null;
  for (const reaction of confession.reactions) {
    reactionCounts[reaction.type] += 1;
    if (reaction.user.toString() === viewer) myReaction = reaction.type;
  }

  return {
    _id: confession._id,
    content: confession.content,
    createdAt: confession.createdAt,
    isMine: authorId === viewer,
    reactionCounts,
    totalReactions: confession.reactionsCount,
    myReaction,
    commentCount: confession.comments.length,
    comments: confession.comments.map((comment) => ({
      _id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      handle:
        comment.author.toString() === authorId
          ? "OP"
          : anonHandle(confession._id, comment.author),
      isMine: comment.author.toString() === viewer,
    })),
    reportedByMe: confession.reports.some(
      (report) => report.user.toString() === viewer
    ),
  };
};

/**
 * GET /api/confessions
 */
exports.getConfessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "newest" } = req.query;
    const safeLimit = Math.min(Number(limit), 30);
    const skip = (Number(page) - 1) * safeLimit;

    const query = {
      university: req.user.university,
      isActive: true,
      isHidden: false,
    };

    const sortOptions = {
      newest: { createdAt: -1 },
      top: { reactionsCount: -1, createdAt: -1 },
    };

    const [confessions, total] = await Promise.all([
      Confession.find(query)
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      Confession.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: confessions.map((c) => serializeConfession(c, req.user._id)),
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
 * POST /api/confessions
 */
exports.createConfession = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return error(res, "Confession can't be empty", 400);
    }
    if (content.trim().length > 1000) {
      return error(res, "Keep it under 1000 characters", 400);
    }

    const confession = await Confession.create({
      content: content.trim(),
      author: req.user._id,
      university: req.user.university,
    });

    return success(
      res,
      serializeConfession(confession, req.user._id),
      "Confessed — anonymously",
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/confessions/:id/react  { type }
 * Toggles the viewer's reaction; switching type replaces the old one.
 */
exports.react = async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive || confession.isHidden) {
      return error(res, "Confession not found", 404);
    }

    const { type } = req.body;
    if (!REACTION_TYPES.includes(type)) {
      return error(res, "Unknown reaction", 400);
    }

    const existing = confession.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existing && existing.type === type) {
      confession.reactions = confession.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
    } else if (existing) {
      existing.type = type;
    } else {
      confession.reactions.push({ user: req.user._id, type });
    }

    confession.reactionsCount = confession.reactions.length;
    await confession.save();

    return success(res, serializeConfession(confession, req.user._id));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/confessions/:id/comments  { content }
 */
exports.addComment = async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive || confession.isHidden) {
      return error(res, "Confession not found", 404);
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return error(res, "Comment can't be empty", 400);
    }
    if (content.trim().length > 500) {
      return error(res, "Keep comments under 500 characters", 400);
    }

    confession.comments.push({
      author: req.user._id,
      content: content.trim(),
    });
    await confession.save();

    // Let the OP know — without revealing who replied.
    if (confession.author.toString() !== req.user._id.toString()) {
      await createNotification(
        confession.author,
        "system",
        "New reply to your confession",
        "Someone replied to your anonymous confession.",
        null,
        null
      );
    }

    return success(
      res,
      serializeConfession(confession, req.user._id),
      "Reply posted",
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/confessions/:id/report  { reason }
 */
exports.report = async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive) {
      return error(res, "Confession not found", 404);
    }

    const alreadyReported = confession.reports.some(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReported) {
      return error(res, "You already reported this confession", 400);
    }

    confession.reports.push({
      user: req.user._id,
      reason: (req.body.reason || "").trim().slice(0, 300),
    });

    if (confession.reports.length >= REPORT_AUTO_HIDE_THRESHOLD) {
      confession.isHidden = true;
    }

    await confession.save();

    return success(res, null, "Reported — thanks for keeping the feed safe");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/confessions/:id  (author only)
 */
exports.deleteConfession = async (req, res, next) => {
  try {
    const confession = req.resource;

    if (
      !confession.isActive ||
      confession.author.toString() !== req.user._id.toString()
    ) {
      return error(res, "Confession not found or not authorized", 404);
    }

    confession.isActive = false;
    await confession.save();

    return success(res, null, "Confession deleted");
  } catch (err) {
    next(err);
  }
};
