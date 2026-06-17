const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const StudyGroup = require("../models/StudyGroup");
const { success } = require("../utils/response");

/**
 * GET /api/study-groups/upcoming
 */
router.get("/upcoming", auth, async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const safeLimit = Math.min(Number(limit), 20);

    const groups = await StudyGroup.find({
      isActive: true,
      university: req.user.university,
      "nextSession.at": { $gte: new Date() },
    })
      .sort({ "nextSession.at": 1 })
      .limit(safeLimit)
      .populate("creator", "displayName avatarUrl");

    return success(res, groups);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
