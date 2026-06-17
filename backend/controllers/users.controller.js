const { success, error } = require("../utils/response");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { isValidHandle, generateUniqueHandle } = require("../utils/handle");

exports.getMe = async (req, res) => {
  // Lazy-backfill a handle for legacy accounts.
  if (!req.user.handle) {
    req.user.handle = await generateUniqueHandle(
      User,
      req.user.email.split("@")[0]
    );
    await req.user.save();
  }
  return success(res, {
    id: req.user._id,
    email: req.user.email,
    displayName: req.user.displayName,
    handle: req.user.handle,
    phone: req.user.phone,
    bio: req.user.bio,
    location: req.user.location,
    avatarUrl: req.user.avatarUrl,
    university: req.user.university,
  });
};

/**
 * GET /api/users/handle-available?handle=
 */
exports.checkHandle = async (req, res) => {
  try {
    const handle = String(req.query.handle || "").toLowerCase().trim();
    if (!isValidHandle(handle)) {
      return success(res, {
        available: false,
        reason: "3–20 chars, letters/numbers/._ only",
      });
    }
    const taken = await User.exists({
      handle,
      _id: { $ne: req.user._id },
    });
    return success(res, { available: !taken });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/**
 * GET /api/users/search?q=
 * Same-university people search by handle (prefix) or display name.
 */
exports.searchUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return success(res, []);

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cleanHandle = q.replace(/^@/, "").toLowerCase();

    const users = await User.find({
      _id: { $ne: req.user._id },
      university: req.user.university,
      isActive: true,
      $or: [
        { handle: { $regex: `^${cleanHandle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` } },
        { displayName: { $regex: escaped, $options: "i" } },
      ],
    })
      .select("displayName handle avatarUrl")
      .limit(20);

    // Annotate each result with the friendship status relative to me.
    // Tolerant of the Friendship model not existing yet (pre-Phase-2).
    let links = [];
    try {
      const Friendship = require("../models/Friendship");
      links = await Friendship.find({ users: req.user._id }).select(
        "requester recipient status users"
      );
    } catch {
      links = [];
    }

    const statusFor = (otherId) => {
      const link = links.find((l) =>
        l.users.some((u) => u.toString() === otherId.toString())
      );
      if (!link) return "none";
      if (link.status === "accepted") return "friends";
      return link.requester.toString() === req.user._id.toString()
        ? "outgoing"
        : "incoming";
    };

    return success(
      res,
      users.map((u) => ({
        _id: u._id,
        displayName: u.displayName,
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        friendStatus: statusFor(u._id),
      }))
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { displayName, email, phone, bio, location, handle } = req.body;

    if (displayName !== undefined) req.user.displayName = displayName;
    if (phone !== undefined) req.user.phone = phone;
    if (bio !== undefined) req.user.bio = bio;
    if (location !== undefined) req.user.location = location;

    if (handle !== undefined) {
      const next = String(handle).toLowerCase().trim();
      if (next !== req.user.handle) {
        if (!isValidHandle(next)) {
          return error(
            res,
            "Handle must be 3–20 chars: letters, numbers, . or _",
            400
          );
        }
        const taken = await User.exists({
          handle: next,
          _id: { $ne: req.user._id },
        });
        if (taken) return error(res, "That handle is taken", 400);
        req.user.handle = next;
      }
    }

    if (email !== undefined && email !== req.user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return error(res, "Email already in use", 400);
      }

      req.user.email = email;
    }

    await req.user.save();

    return success(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        handle: req.user.handle,
        phone: req.user.phone,
        bio: req.user.bio,
        location: req.user.location,
        avatarUrl: req.user.avatarUrl,
        university: req.user.university,
      },
    }, "Profile updated successfully");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image uploaded", 400);
    }

    req.user.avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    return success(
      res,
      { avatarUrl: req.user.avatarUrl },
      "Avatar updated successfully"
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updatePaymentInfo = async (req, res) => {
  try {
    const { upiId, upiQrUrl } = req.body;

    if (!upiId && !upiQrUrl) {
      return error(res, "Nothing to update", 400);
    }

    if (upiId !== undefined) {
      req.user.paymentInfo.upiId = upiId;
    }

    if (upiQrUrl !== undefined) {
      req.user.paymentInfo.upiQrUrl = upiQrUrl;
    }

    await req.user.save();

    return success(res, req.user.paymentInfo, "Payment info updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/**
 * PUT /api/users/payment-qr
 */
exports.uploadPaymentQr = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image uploaded", 400);
    }

    req.user.paymentInfo.upiQrUrl = req.file.path;
    await req.user.save();

    return success(
      res,
      { upiQrUrl: req.user.paymentInfo.upiQrUrl },
      "Payment QR updated"
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};


exports.toggleSavedListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const index = req.user.savedListings.findIndex(
      (id) => id.toString() === listingId
    );

    if (index > -1) {
      req.user.savedListings.splice(index, 1);
    } else {
      req.user.savedListings.push(listingId);
    }

    await req.user.save();

    return success(res, req.user.savedListings);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { messages, studyGroups, marketplace } = req.body;

    if (messages !== undefined) req.user.notificationPreferences.messages = messages;
    if (studyGroups !== undefined) req.user.notificationPreferences.studyGroups = studyGroups;
    if (marketplace !== undefined) req.user.notificationPreferences.marketplace = marketplace;

    await req.user.save();

    return success(res, req.user.notificationPreferences, "Notification preferences updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const { profileVisibility, showOnlineStatus, allowDirectMessages } = req.body;

    if (profileVisibility !== undefined) req.user.privacySettings.profileVisibility = profileVisibility;
    if (showOnlineStatus !== undefined) req.user.privacySettings.showOnlineStatus = showOnlineStatus;
    if (allowDirectMessages !== undefined) req.user.privacySettings.allowDirectMessages = allowDirectMessages;

    await req.user.save();

    return success(res, req.user.privacySettings, "Privacy settings updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getSettings = async (req, res) => {
  try {
    return success(res, {
      notificationPreferences: req.user.notificationPreferences,
      privacySettings: req.user.privacySettings,
      paymentInfo: req.user.paymentInfo
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/**
 * DELETE /api/users/me
 */
exports.deleteMe = async (req, res, next) => {
  try {
    await Listing.deleteMany({ seller: req.user._id });
    await req.user.deleteOne();

    return success(res, null, "Account deleted");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/me/saved-listings
 */
exports.getSavedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      _id: { $in: req.user.savedListings },
      university: req.user.university,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("seller", "displayName avatarUrl");

    return success(res, listings);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id/profile
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = req.resource;

    if (!user) {
      return error(res, "User not found", 404);
    }

    const Document = require("../models/Document");
    const Question = require("../models/Question");
    const Answer = require("../models/Answer");
    const Event = require("../models/Event");
    const Ride = require("../models/Ride");

    const scope = { university: req.user.university };

    const Friendship = require("../models/Friendship");
    const isSelf = user._id.toString() === req.user._id.toString();

    const [listings, documents, questions, answers, events, rides, link] =
      await Promise.all([
        Listing.find({ seller: user._id, ...scope, isActive: true })
          .sort({ createdAt: -1 })
          .populate("seller", "displayName avatarUrl"),
        Document.countDocuments({ uploader: user._id, ...scope, isActive: true }),
        Question.countDocuments({ author: user._id, ...scope, isActive: true }),
        Answer.countDocuments({ author: user._id, ...scope, isActive: true }),
        Event.countDocuments({ organizer: user._id, ...scope, isActive: true }),
        Ride.countDocuments({ poster: user._id, ...scope, isActive: true }),
        isSelf
          ? null
          : Friendship.findOne({
              users: [req.user._id.toString(), user._id.toString()].sort(),
            }),
      ]);

    let friendStatus = "self";
    if (!isSelf) {
      if (!link) friendStatus = "none";
      else if (link.status === "accepted") friendStatus = "friends";
      else
        friendStatus =
          link.requester.toString() === req.user._id.toString()
            ? "outgoing"
            : "incoming";
    }

    return success(res, {
      user: {
        id: user._id,
        displayName: user.displayName,
        handle: user.handle,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        university: user.university,
        memberSince: user.createdAt,
        points: user.points || 0,
        badges: user.badges || [],
        friendStatus,
      },
      paymentInfo: user.paymentInfo,
      listings,
      stats: {
        totalListings: listings.length,
        documents,
        questions,
        answers,
        events,
        rides,
      },
    });
  } catch (err) {
    next(err);
  }
};
