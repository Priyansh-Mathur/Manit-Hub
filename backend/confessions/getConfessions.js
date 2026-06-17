const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Confession = require("../models/Confession");
const serializeConfession = require("./serializeConfession");

/**
 * GET /api/confessions
 */
router.get("/", auth, async (req, res, next) => {
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
});

module.exports = router;
