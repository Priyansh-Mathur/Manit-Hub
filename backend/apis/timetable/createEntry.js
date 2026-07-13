const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const TimetableEntry = require("../../models/TimetableEntry");
const { success, error } = require("../../utils/response");
const validateEntry = require("./validateEntry");

/**
 * POST /api/timetable
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { subject, dayOfWeek, startTime, endTime, room, professor } =
      req.body;

    const validationError = validateEntry(req.body);
    if (validationError) return error(res, validationError, 400);

    const entry = await TimetableEntry.create({
      subject: subject.trim(),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      room,
      professor,
      user: req.user._id,
      university: req.user.university,
    });

    return success(res, entry, "Class added", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
