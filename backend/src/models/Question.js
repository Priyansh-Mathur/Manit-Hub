const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    body: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    branch: {
      type: String,
      trim: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    semester: {
      type: String,
      trim: true,
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
      index: true,
    },

    answersCount: {
      type: Number,
      default: 0,
    },

    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ title: "text", body: "text", subject: "text" });
questionSchema.index({ university: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
