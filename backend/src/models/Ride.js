const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    poster: {
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

    from: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    to: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    departureAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Seats for co-passengers (the poster's own seat not included).
    seatsTotal: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    passengers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Used by the shared conversation loader (and handy for notifications).
rideSchema.virtual("title").get(function () {
  return `${this.from} → ${this.to}`;
});

rideSchema.index({ university: 1, isActive: 1, departureAt: 1 });

module.exports = mongoose.model("Ride", rideSchema);
