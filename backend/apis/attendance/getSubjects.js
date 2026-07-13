const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const AttendanceSubject = require("../../models/AttendanceSubject");
const { success } = require("../../utils/response");

/**
 * GET /api/attendance
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const subjects = await AttendanceSubject.find({
      user: req.user._id,
      university: req.user.university,
    }).sort({ createdAt: 1 });

    return success(res, subjects);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
