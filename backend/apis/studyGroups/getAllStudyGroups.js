const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const StudyGroup = require("../../models/StudyGroup");
const { success } = require("../../utils/response");

/**
 * GET /api/study-groups
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const { search, subject, myGroups, page = 1, limit = 12 } = req.query;
    const safeLimit = Math.min(Number(limit), 50);

    const query = {
      isActive: true,
      university: req.user.university,
    };

    if (subject) query.subject = subject;

    if (search) {
      query.$text = { $search: search };
    }

    if (myGroups === "true") {
      query.members = req.user._id;
    }

    const skip = (Number(page) - 1) * safeLimit;

    const [groups, total] = await Promise.all([
      StudyGroup.find(query)
        .populate("creator", "displayName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      StudyGroup.countDocuments(query),
    ]);

    return success(res, {
      groups,
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
