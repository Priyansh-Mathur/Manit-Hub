const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const User = require("../models/User");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * GET /api/users/:id/profile
 */
router.get("/:id/profile", auth, universityScope(User), async (req, res, next) => {
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
});

module.exports = router;
