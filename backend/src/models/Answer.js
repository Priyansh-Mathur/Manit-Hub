const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },

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

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    upvotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    upvoteCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

answerSchema.index({ question: 1, isActive: 1 });

module.exports = mongoose.model("Answer", answerSchema);
