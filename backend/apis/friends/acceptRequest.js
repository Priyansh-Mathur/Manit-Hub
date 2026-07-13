const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Friendship = require("../../models/Friendship");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");
const { sortedPair } = require("./helpers");

/**
 * PATCH /api/friends/requests/:userId/accept — accept an incoming request.
 */
router.patch("/requests/:userId/accept", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOne({ users, status: "pending" });
    if (!link || link.recipient.toString() !== req.user._id.toString()) {
      return error(res, "No pending request from this user", 404);
    }

    link.status = "accepted";
    await link.save();

    await createNotification(
      link.requester,
      "friend",
      "Friend request accepted",
      `${req.user.displayName} (@${req.user.handle}) accepted your friend request.`,
      req.user._id,
      "User"
    );

    return success(res, null, "You're now friends");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
