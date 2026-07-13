const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Friendship = require("../../models/Friendship");
const { success, error } = require("../../utils/response");
const { sortedPair } = require("./helpers");

/**
 * DELETE /api/friends/requests/:userId — decline incoming OR cancel outgoing.
 */
router.delete("/requests/:userId", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOneAndDelete({ users, status: "pending" });
    if (!link) {
      return error(res, "No pending request", 404);
    }

    return success(res, null, "Request removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
