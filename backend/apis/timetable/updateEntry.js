const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const TimetableEntry = require("../../models/TimetableEntry");
const { success, error } = require("../../utils/response");
const validateEntry = require("./validateEntry");

/**
 * PUT /api/timetable/:id
 */
router.put("/:id", auth, universityScope(TimetableEntry), async (req, res, next) => {
  try {
    const entry = req.resource;

    if (entry.user.toString() !== req.user._id.toString()) {
      return error(res, "Class not found", 404);
    }

    const { subject, dayOfWeek, startTime, endTime, room, professor } =
      req.body;

    const merged = {
      subject: subject ?? entry.subject,
      dayOfWeek: dayOfWeek ?? entry.dayOfWeek,
      startTime: startTime ?? entry.startTime,
      endTime: endTime ?? entry.endTime,
    };
    const validationError = validateEntry(merged);
    if (validationError) return error(res, validationError, 400);

    entry.subject = merged.subject.trim();
    entry.dayOfWeek = Number(merged.dayOfWeek);
    entry.startTime = merged.startTime;
    entry.endTime = merged.endTime;
    if (room !== undefined) entry.room = room;
    if (professor !== undefined) entry.professor = professor;
    // Schedule changed — allow a reminder for the new slot today.
    entry.lastReminderDay = null;

    await entry.save();
    return success(res, entry, "Class updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
