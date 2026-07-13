const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const User = require("../../models/User");
const Listing = require("../../models/Listing");
const { success, error } = require("../../utils/response");

/**
 * GET /api/users/:id/profile
 */
router.get("/:id/profile", auth, universityScope(User), async (req, res, next) => {
  try {
    const user = req.resource;

    if (!user) {
      return error(res, "User not found", 404);
    }

    const Document = require("../../models/Document");
    const Question = require("../../models/Question");
    const Answer = require("../../models/Answer");
    const Event = require("../../models/Event");
    const Ride = require("../../models/Ride");

    const scope = { university: req.user.university };

    const Friendship = require("../../models/Friendship");
    const isSelf = user._id.toString() === req.user._id.toString();

    // Respect the target user's privacy setting. "private" profiles are only
    // visible to the user themselves; "students"/"everyone" are visible to any
    // signed-in same-university student (which the auth + scope already ensure).
    const visibility = user.privacySettings?.profileVisibility || "everyone";
    if (visibility === "private" && !isSelf) {
      return error(res, "This profile is private", 403);
    }

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

    // Phone is personal contact info — only expose it to the user themselves or
    // to accepted friends, so it can't be harvested from every profile. (Chat
    // exists for contacting non-friends.)
    const canSeePhone = isSelf || friendStatus === "friends";

    return success(res, {
      user: {
        id: user._id,
        displayName: user.displayName,
        handle: user.handle,
        phone: canSeePhone ? user.phone : "",
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
});

module.exports = router;
