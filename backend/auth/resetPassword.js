const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const { success, error } = require("../utils/response");

/**
 * POST /api/auth/reset-password
 */
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return error(res, "Token and password are required", 400);
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return error(res, "Invalid or expired token", 400);
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return success(res, null, "Password reset successful");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
