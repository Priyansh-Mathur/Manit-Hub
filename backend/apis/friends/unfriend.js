const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Friendship = require("../../models/Friendship");
const { success, error } = require("../../utils/response");
const { sortedPair } = require("./helpers");

/**
 * DELETE /api/friends/:userId — unfriend.
 */
router.delete("/:userId", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = sortedPair(req.user._id, userId);

    const link = await Friendship.findOneAndDelete({ users, status: "accepted" });
    if (!link) {
      return error(res, "You're not friends with this user", 404);
    }

    return success(res, null, "Removed from friends");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
