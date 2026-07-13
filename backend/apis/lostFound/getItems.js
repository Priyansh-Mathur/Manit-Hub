const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const LostFoundItem = require("../../models/LostFoundItem");

/**
 * GET /api/lost-found
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const {
      search,
      kind,
      category,
      status,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const safeLimit = Math.min(Number(limit), 50);
    const query = {
      isActive: true,
      university: req.user.university,
    };

    if (kind && kind !== "all") query.kind = kind;
    if (category && category !== "All") query.category = category;
    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const skip = (Number(page) - 1) * safeLimit;

    const [items, total] = await Promise.all([
      LostFoundItem.find(query)
        .populate("reporter", "displayName avatarUrl")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      LostFoundItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
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
