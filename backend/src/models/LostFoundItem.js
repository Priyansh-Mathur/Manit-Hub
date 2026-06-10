const mongoose = require("mongoose");

const lostFoundItemSchema = new mongoose.Schema(
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

    // Whether the poster lost the item or found someone else's.
    kind: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "ID & Cards",
        "Books & Notes",
        "Clothing",
        "Keys",
        "Accessories",
        "Other",
      ],
    },

    location: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    reporter: {
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

    status: {
      type: String,
      enum: ["open", "returned"],
      default: "open",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

lostFoundItemSchema.index({ title: "text", description: "text" });
lostFoundItemSchema.index({ university: 1, isActive: 1 });

module.exports = mongoose.model("LostFoundItem", lostFoundItemSchema);
