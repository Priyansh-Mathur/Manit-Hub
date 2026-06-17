const mongoose = require("mongoose");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timetableEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    // 0 = Sunday … 6 = Saturday (JS Date convention).
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    // 24h "HH:mm" local campus time (IST).
    startTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, "Invalid start time"],
    },

    endTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, "Invalid end time"],
    },

    room: {
      type: String,
      trim: true,
      maxlength: 60,
    },

    professor: {
      type: String,
      trim: true,
      maxlength: 60,
    },

    // "YYYY-MM-DD" of the last day a reminder was sent — stops duplicates.
    lastReminderDay: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

timetableEntrySchema.index({ user: 1, dayOfWeek: 1, startTime: 1 });

module.exports = mongoose.model("TimetableEntry", timetableEntrySchema);
