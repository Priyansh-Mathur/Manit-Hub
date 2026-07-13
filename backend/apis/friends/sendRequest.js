const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const Friendship = require("../../models/Friendship");
const User = require("../../models/User");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");
const { sortedPair } = require("./helpers");

/**
 * POST /api/friends/requests/:userId — send a friend request.
 */
router.post("/requests/:userId", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return error(res, "Invalid user", 400);
    }
    if (userId === req.user._id.toString()) {
      return error(res, "You can't friend yourself", 400);
    }

    const other = await User.findById(userId);
    if (!other || !other.isActive) {
      return error(res, "User not found", 404);
    }
    if (other.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    const users = sortedPair(req.user._id, other._id);
    const existing = await Friendship.findOne({ users });
    if (existing) {
      return error(
        res,
        existing.status === "accepted"
          ? "You're already friends"
          : "A request is already pending",
        400
      );
    }

    await Friendship.create({
      requester: req.user._id,
      recipient: other._id,
      users,
      status: "pending",
      university: req.user.university,
    });

    await createNotification(
      other._id,
      "friend",
      "New friend request",
      `${req.user.displayName} (@${req.user.handle}) sent you a friend request.`,
      req.user._id,
      "User"
    );

    return success(res, null, "Friend request sent", 201);
  } catch (err) {
    // Unique-index race → treat as already-exists.
    if (err.code === 11000) {
      return error(res, "A request already exists", 400);
    }
    next(err);
  }
});

module.exports = router;
