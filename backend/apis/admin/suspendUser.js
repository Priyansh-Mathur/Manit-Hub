const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");
const User = require("../../models/User");

/**
 * PATCH /api/admin/users/:id/suspend  (admin)
 * Body: { reason }. Bans the account and bumps tokenVersion so any live
 * session dies on its next request (see middleware/auth.js token-version check).
 */
router.patch("/users/:id/suspend", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return error(res, "Invalid user id", 400);
    }

    const target = await User.findById(id).select("isAdmin isBanned");
    if (!target) {
      return error(res, "User not found", 404);
    }
    if (target.isAdmin) {
      return error(res, "Admin accounts cannot be suspended", 403);
    }

    const reason = String(req.body?.reason || "").trim();

    const updated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBanned: true,
          banReason: reason || "Suspended by admin",
          bannedAt: new Date(),
        },
        $inc: { tokenVersion: 1 },
      },
      { new: true }
    ).select("displayName handle email isBanned banReason bannedAt strikes");

    return success(res, updated, "Account suspended");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
