const mongoose = require("mongoose");

const REACTION_TYPES = ["heart", "laugh", "wow", "sad"];

const commentSchema = new mongoose.Schema(
  {
    // Stored for moderation/notifications — NEVER exposed via the API.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const confessionSchema = new mongoose.Schema(
  {
    // Stored privately so moderators can act on abuse — never serialized.
    author: {
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

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: REACTION_TYPES,
          required: true,
        },
      },
    ],

    // Denormalized for the "Top" sort.
    reactionsCount: {
      type: Number,
      default: 0,
      index: true,
    },

    comments: [commentSchema],

    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: {
          type: String,
          trim: true,
          maxlength: 300,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Moderation hooks: auto-hidden once reports cross the threshold.
    isHidden: {
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

confessionSchema.index({ university: 1, isActive: 1, isHidden: 1, createdAt: -1 });

module.exports = mongoose.model("Confession", confessionSchema);
module.exports.REACTION_TYPES = REACTION_TYPES;
