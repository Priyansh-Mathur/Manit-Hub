const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const Report = require("../../models/Report");

/**
 * GET /api/reports?status=open  (admin)
 */
router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const { status = "open", page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * safeLimit;

    const query = { university: req.user.university };
    if (status !== "all") query.status = status;

    const [reports, total, openCount] = await Promise.all([
      Report.find(query)
        .populate("reporter", "displayName avatarUrl")
        .populate("handledBy", "displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Report.countDocuments(query),
      Report.countDocuments({ university: req.user.university, status: "open" }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        openCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
