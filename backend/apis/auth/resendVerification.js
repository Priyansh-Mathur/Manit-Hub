const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../../models/User");
const { success, error } = require("../../utils/response");
const { isEmailConfigured, sendMail } = require("../../utils/mailer");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../../utils/email");

/**
 * POST /api/auth/resend-verification
 * Re-sends the signup verification code. Response is intentionally the same
 * whether or not the account exists / is already verified.
 */
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return error(res, "Email is required", 400);
    }

    if (!isValidScholarEmail(email)) {
      return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
    }

    if (!isEmailConfigured()) {
      return error(res, "Email verification is not enabled", 400);
    }

    const user = await User.findOne({
      email: normalizeEmail(email),
      emailVerified: false,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (user) {
      const verificationCode = crypto.randomInt(100000, 1000000).toString();
      user.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");
      user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      await sendMail({
        to: user.email,
        subject: "Manit Hub — verify your email",
        text: `Your new verification code is: ${verificationCode}\n\nIt expires in 30 minutes. If you didn't request this, you can ignore this email.`,
      });
    }

    return success(res, null, "If the account needs verification, a code was sent");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
