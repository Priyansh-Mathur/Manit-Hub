const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["Notes", "PYQ", "Syllabus", "Sem Schedule", "Other"],
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

    year: {
      type: Number,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      trim: true,
    },

    fileFormat: {
      type: String,
      trim: true,
    },

    fileSize: {
      type: Number,
    },

    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },

    downloadCount: {
      type: Number,
      default: 0,
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

    // Denormalized for the "Top rated" sort.
    upvoteCount: {
      type: Number,
      default: 0,
      index: true,
    },

    comments: {
      type: [
        {
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
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

documentSchema.index({ title: "text", subject: "text" });
documentSchema.index({ university: 1, isActive: 1 });

module.exports = mongoose.model("Document", documentSchema);
