const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\d{10}@stu\.manit\.ac\.in$/, "Invalid MANIT scholar email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique, shareable @handle used to find people (Instagram-style).
    // Sparse so legacy users without one don't collide on null.
    handle: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_.]{3,20}$/, "Invalid handle"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },

    // Moderation rights for the admin review queue.
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Gamification — earned by contributing (uploads, answers, listings…).
    points: {
      type: Number,
      default: 0,
      index: true,
    },

    badges: {
      type: [String],
      default: [],
    },

    /**
     * Saved / Interested listings (wishlist-style)
     */
    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],

    paymentInfo: {
      upiId: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Invalid UPI ID"],
      },
      upiQrUrl: {
        type: String,
        trim: true,
      },
    },

    notificationPreferences: {
      messages: {
        type: Boolean,
        default: true,
      },
      studyGroups: {
        type: Boolean,
        default: true,
      },
      marketplace: {
        type: Boolean,
        default: true,
      },
    },

    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["everyone", "students", "private"],
        default: "everyone",
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      allowDirectMessages: {
        type: Boolean,
        default: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Moderation: a suspended account can't log in or use the API/socket.
    // `strikes` accumulates when this user's content is auto-hidden or removed
    // by a moderator; a ban can be set manually or triggered by strikes.
    isBanned: {
      type: Boolean,
      default: false,
    },

    strikes: {
      type: Number,
      default: 0,
    },

    banReason: {
      type: String,
      default: "",
    },

    bannedAt: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Bumped on password reset to invalidate all previously issued JWTs.
    // Legacy tokens without a `tv` claim are treated as version 0.
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    // Email ownership verification. Missing/true = verified — legacy accounts
    // (created before verification existed) must keep working, so only
    // accounts explicitly created with `false` are gated at login.
    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before save
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Compare password for login
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
