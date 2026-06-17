const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Denormalized from the listing for fast "offers received" queries.
    seller: {
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

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Seller's counter-offer amount (status becomes "countered").
    counterAmount: {
      type: Number,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "countered", "accepted", "declined", "withdrawn"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

offerSchema.index({ listing: 1, buyer: 1, status: 1 });

module.exports = mongoose.model("Offer", offerSchema);
