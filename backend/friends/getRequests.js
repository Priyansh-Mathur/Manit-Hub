const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Friendship = require("../models/Friendship");
const { success } = require("../utils/response");
const { PUBLIC_FIELDS } = require("./helpers");

/**
 * GET /api/friends/requests — { incoming, outgoing } pending requests.
 */
router.get("/requests", auth, async (req, res, next) => {
  try {
    const pending = await Friendship.find({
      users: req.user._id,
      status: "pending",
    })
      .populate("requester", PUBLIC_FIELDS)
      .populate("recipient", PUBLIC_FIELDS)
      .sort({ createdAt: -1 });

    const me = req.user._id.toString();
    const incoming = [];
    const outgoing = [];

    for (const link of pending) {
      if (link.requester._id.toString() === me) {
        outgoing.push({
          _id: link.recipient._id,
          displayName: link.recipient.displayName,
          handle: link.recipient.handle,
          avatarUrl: link.recipient.avatarUrl,
          requestedAt: link.createdAt,
        });
      } else {
        incoming.push({
          _id: link.requester._id,
          displayName: link.requester.displayName,
          handle: link.requester.handle,
          avatarUrl: link.requester.avatarUrl,
          requestedAt: link.createdAt,
        });
      }
    }

    return success(res, { incoming, outgoing });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
