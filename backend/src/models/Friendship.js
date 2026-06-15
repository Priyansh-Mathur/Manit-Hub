const mongoose = require("mongoose");

// One document per pair of users. `users` is the sorted [a,b] pair used for
// the unique index (mirrors the participants.sort() idiom in Conversation.js),
// so there can only ever be a single relationship between two people.
const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A friendship has exactly 2 users",
      },
    },

    // Canonical "<lowId>_<highId>" key. A unique index on the `users` ARRAY
    // would be multikey (unique per element — i.e. one friendship per user!),
    // so pair uniqueness lives on this scalar instead.
    pairKey: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
      index: true,
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Keep `users` sorted and derive the unique pair key.
friendshipSchema.pre("validate", function () {
  if (this.users?.length) {
    this.users = this.users.map(String).sort();
    this.pairKey = this.users.join("_");
  }
});

friendshipSchema.index({ users: 1, status: 1 });

module.exports = mongoose.model("Friendship", friendshipSchema);
