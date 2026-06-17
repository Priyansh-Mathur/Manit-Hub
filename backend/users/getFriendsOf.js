const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const User = require("../models/User");
const Friendship = require("../models/Friendship");
const { success } = require("../utils/response");

// Same public fields the friends endpoints expose (see friends/helpers.js).
const PUBLIC_FIELDS = "displayName handle avatarUrl";

/**
 * GET /api/users/:id/friends — another user's friends list (profile view).
 * Mounted with universityScope(User), so req.resource is the profile owner.
 * Private profiles only reveal the list to themselves and their own friends;
 * everyone still sees the count.
 */
router.get("/:id/friends", auth, universityScope(User), async (req, res, next) => {
  try {
    const owner = req.resource;
    const viewer = req.user._id.toString();
    const isSelf = owner._id.toString() === viewer;

    const links = await Friendship.find({
      users: owner._id,
      status: "accepted",
    })
      .populate("requester", PUBLIC_FIELDS)
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ updatedAt: -1 });

    const friends = links.map((link) => {
      const other =
        link.requester._id.toString() === owner._id.toString()
          ? link.recipient
          : link.requester;
      return {
        _id: other._id,
        displayName: other.displayName,
        handle: other.handle,
        avatarUrl: other.avatarUrl,
      };
    });

    const viewerIsFriend = friends.some((f) => f._id.toString() === viewer);
    const isPrivate = owner.privacySettings?.profileVisibility === "private";
    const hidden = isPrivate && !isSelf && !viewerIsFriend;

    return success(res, {
      count: friends.length,
      hidden,
      friends: hidden ? [] : friends,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
