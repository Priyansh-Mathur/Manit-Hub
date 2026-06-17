const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Friendship = require("../models/Friendship");
const { success } = require("../utils/response");
const presence = require("../socket/presence");
const { PUBLIC_FIELDS } = require("./helpers");

/**
 * GET /api/friends — accepted friends, annotated with live online status.
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const links = await Friendship.find({
      users: req.user._id,
      status: "accepted",
    })
      .populate("requester", `${PUBLIC_FIELDS} privacySettings.showOnlineStatus`)
      .populate("recipient", `${PUBLIC_FIELDS} privacySettings.showOnlineStatus`)
      .sort({ updatedAt: -1 });

    const me = req.user._id.toString();
    const friends = links.map((link) => {
      const other =
        link.requester._id.toString() === me ? link.recipient : link.requester;
      // Respect the friend's own "show online status" privacy choice.
      const shows = other.privacySettings?.showOnlineStatus !== false;
      return {
        _id: other._id,
        displayName: other.displayName,
        handle: other.handle,
        avatarUrl: other.avatarUrl,
        isOnline: shows && presence.isOnline(other._id),
        since: link.updatedAt,
      };
    });

    return success(res, friends);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
