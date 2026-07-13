const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const crypto = require("crypto");
const { success, error } = require("../../utils/response");
const { isEmailConfigured, sendMail } = require("../../utils/mailer");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../../utils/email");

/**
 * POST /api/auth/forgot-password
 */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return error(res, "Email is required", 400);
    }

    if (!isValidScholarEmail(email)) {
      return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select(
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

    if (isEmailConfigured()) {
      await sendMail({
        to: user.email,
        subject: "Manit Hub — password reset",
        text: `Someone requested a password reset for your Manit Hub account.\n\nYour reset token is:\n\n${resetToken}\n\nPaste it in the "Reset password" form in the app. It expires in 30 minutes. If this wasn't you, ignore this email — your password is unchanged.`,
      });
      return success(res, null, "If the email exists, a reset link was sent");
    }

    // No mailer configured: local-dev fallback only. NEVER return the token
    // in production — that would be a one-request account takeover.
    const payload =
      process.env.NODE_ENV !== "production" ? { resetToken } : null;

    return success(res, payload, "Password reset link sent");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
