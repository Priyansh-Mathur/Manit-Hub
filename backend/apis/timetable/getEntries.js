const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const TimetableEntry = require("../../models/TimetableEntry");
const { success } = require("../../utils/response");

/**
 * GET /api/timetable
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const entries = await TimetableEntry.find({
      user: req.user._id,
      university: req.user.university,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    return success(res, entries);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
