const mongoose = require("mongoose");

const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    credits: {
      type: Number,
      required: true,
      min: 0.5,
      max: 30,
    },

    grade: {
      type: String,
      required: true,
      enum: GRADES,
    },
  },
  { _id: false }
);

const academicRecordSchema = new mongoose.Schema(
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

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    subjects: {
      type: [subjectSchema],
      default: [],
    },
  },
  { timestamps: true }
);

academicRecordSchema.index({ user: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);
module.exports.GRADES = GRADES;
