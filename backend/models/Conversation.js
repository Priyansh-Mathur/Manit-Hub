const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Polymorphic context id — a Listing for marketplace chats, or the
    // LostFoundItem / Ride the conversation was started from (see contextType).
    // Null for direct friend DMs (contextType "friend"), which have no listing.
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },

    contextType: {
      type: String,
      enum: ["listing", "lostfound", "ride", "friend"],
      default: "listing",
    },

    // Empty for friend DMs — the UI shows the other participant's name instead.
    listingTitle: {
      type: String,
      trim: true,
      default: "",
    },

    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },

    lastMessage: {
      type: String,
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.pre("save", function () {
  if (this.participants?.length) {
    this.participants = this.participants.map(String).sort();
  }
});

// Lookup index for "my conversations" (getUserConversations filters by
// participants). NOT unique: a unique index on the participants array is
// multikey, which wrongly caps each user at one conversation per listingId
// value — e.g. one friend DM total, or only the first buyer per listing.
// Duplicate conversations are instead prevented at the application layer
// (createConversation does findOne-then-create for each pair + context).
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);