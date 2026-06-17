const TimetableEntry = require("../models/TimetableEntry");
const { success, error } = require("../utils/response");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateEntry = ({ subject, dayOfWeek, startTime, endTime }) => {
  if (!subject || !subject.trim()) return "Subject is required";
  const day = Number(dayOfWeek);
  if (Number.isNaN(day) || day < 0 || day > 6) return "Invalid day";
  if (!TIME_PATTERN.test(startTime)) return "Invalid start time";
  if (!TIME_PATTERN.test(endTime)) return "Invalid end time";
  if (endTime <= startTime) return "Class must end after it starts";
  return null;
};

/**
 * GET /api/timetable
 */
exports.getEntries = async (req, res, next) => {
  try {
    const entries = await TimetableEntry.find({
      user: req.user._id,
      university: req.user.university,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    return success(res, entries);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/timetable
 */
exports.createEntry = async (req, res, next) => {
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
};

/**
 * PUT /api/timetable/:id
 */
exports.updateEntry = async (req, res, next) => {
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
};

/**
 * DELETE /api/timetable/:id
 */
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = req.resource;

    if (entry.user.toString() !== req.user._id.toString()) {
      return error(res, "Class not found", 404);
    }

    await entry.deleteOne();
    return success(res, null, "Class removed");
  } catch (err) {
    next(err);
  }
};
