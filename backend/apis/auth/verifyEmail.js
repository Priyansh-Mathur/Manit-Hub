const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const { success, error } = require("../../utils/response");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../../utils/email");

/**
 * POST /api/auth/verify-email
 * Confirms the 6-digit code emailed at signup, then signs the user in.
 */
router.post("/verify-email", async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return error(res, "Email and verification code are required", 400);
    }

    if (!isValidScholarEmail(email)) {
      return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
    }

    const hashedCode = crypto
      .createHash("sha256")
      .update(String(code).trim())
      .digest("hex");

    const user = await User.findOne({
      email: normalizeEmail(email),
      emailVerified: false,
      emailVerificationToken: hashedCode,
      emailVerificationExpires: { $gt: new Date() },
    })
      .select("+emailVerificationToken +emailVerificationExpires +tokenVersion")
      .populate("university", "name logoUrl");

    if (!user) {
      return error(res, "Invalid or expired verification code", 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    const token = generateToken(user._id, user.university._id, user.tokenVersion || 0);

    return success(res, {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        handle: user.handle,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        university: user.university,
        isAdmin: user.isAdmin === true,
      },
      token,
    }, "Email verified");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
