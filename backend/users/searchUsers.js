const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { success, error } = require("../utils/response");

/**
 * GET /api/users/search?q=
 * Same-university people search by handle (prefix) or display name.
 */
router.get("/search", auth, async (req, res) => {
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
});

module.exports = router;
