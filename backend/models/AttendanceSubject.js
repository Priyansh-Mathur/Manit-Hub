const mongoose = require("mongoose");

const attendanceSubjectSchema = new mongoose.Schema(
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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Classes attended out of classes held so far.
    attended: {
      type: Number,
      default: 0,
      min: 0,
    },

    held: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Minimum attendance % the student wants to stay above.
    target: {
      type: Number,
      default: 75,
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

attendanceSubjectSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model("AttendanceSubject", attendanceSubjectSchema);
