const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");
const User = require("../../models/User");

/**
 * PATCH /api/admin/users/:id/unsuspend  (admin)
 * Lifts a suspension and resets strikes to 0 — used to reverse an automatic
 * ban caused by fake/malicious reports so the user isn't re-banned instantly.
 */
router.patch("/users/:id/unsuspend", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return error(res, "Invalid user id", 400);
    }

    const updated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBanned: false,
          strikes: 0,
          banReason: "",
          bannedAt: null,
        },
      },
      { new: true }
    ).select("displayName handle email isBanned banReason bannedAt strikes");

    if (!updated) {
      return error(res, "User not found", 404);
    }

    return success(res, updated, "Account reinstated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
