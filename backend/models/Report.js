const mongoose = require("mongoose");

const TARGET_TYPES = [
  "listing",
  "document",
  "confession",
  "question",
  "answer",
  "lostfound",
  "ride",
  "event",
];

const reportSchema = new mongoose.Schema(
  {
    reporter: {
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

    targetType: {
      type: String,
      required: true,
      enum: TARGET_TYPES,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Small copy of the reported content so the queue stays reviewable
    // even after the target is removed.
    snapshot: {
      title: { type: String, trim: true },
      content: { type: String, trim: true, maxlength: 500 },
    },

    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
      index: true,
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    handledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportSchema.index({ university: 1, status: 1, createdAt: -1 });
reportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Report", reportSchema);
module.exports.TARGET_TYPES = TARGET_TYPES;
