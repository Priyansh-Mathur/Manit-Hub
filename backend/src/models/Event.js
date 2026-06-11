const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    organizer: {
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Organizing club / society shown on the card.
    club: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    category: {
      type: String,
      required: true,
      enum: ["Cultural", "Technical", "Sports", "Workshop", "Talk", "Other"],
    },

    venue: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    startAt: {
      type: Date,
      required: true,
      index: true,
    },

    endAt: {
      type: Date,
    },

    attendees: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    // One reminder per event, ~1 hour before start.
    reminderSent: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", club: "text" });
eventSchema.index({ university: 1, isActive: 1, startAt: 1 });

module.exports = mongoose.model("Event", eventSchema);
