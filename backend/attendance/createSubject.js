const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const AttendanceSubject = require("../models/AttendanceSubject");
const { success, error } = require("../utils/response");

/**
 * POST /api/attendance
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { name, attended = 0, held = 0, target = 75 } = req.body;

    if (!name || !name.trim()) {
      return error(res, "Subject name is required", 400);
    }

    const attendedNum = Math.max(0, Number(attended) || 0);
    const heldNum = Math.max(0, Number(held) || 0);
    if (attendedNum > heldNum) {
      return error(res, "Attended classes can't exceed classes held", 400);
    }

    const targetNum = Number(target) || 75;
    if (targetNum < 1 || targetNum > 100) {
      return error(res, "Target must be between 1 and 100", 400);
    }

    const subject = await AttendanceSubject.create({
      name: name.trim(),
      attended: attendedNum,
      held: heldNum,
      target: targetNum,
      user: req.user._id,
      university: req.user.university,
    });

    return success(res, subject, "Subject added", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
