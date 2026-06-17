const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const { success, error } = require("../utils/response");

/**
 * POST /api/auth/forgot-password
 */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return error(res, "Email is required", 400);
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      return success(res, null, "If the email exists, a reset link was sent");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const payload =
      process.env.NODE_ENV !== "production"
        ? { resetToken }
        : null;

    return success(res, payload, "Password reset link sent");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
