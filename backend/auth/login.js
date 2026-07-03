const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");
const { generateUniqueHandle } = require("../utils/handle");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../utils/email");

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password required", 400);
    }

    if (!isValidScholarEmail(email)) {
      return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail })
      .select("+password +tokenVersion")
      .populate("university", "name logoUrl");

    if (!user) {
      return error(res, "Invalid credentials", 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, "Invalid credentials", 400);
    }

    // Suspended accounts can't sign in.
    if (user.isBanned) {
      return error(res, "Your account has been suspended", 403);
    }

    // Accounts created under the email-verification regime must verify
    // first. Legacy accounts (field missing → default true) are unaffected.
    if (user.emailVerified === false) {
      return error(res, "Please verify your email to sign in", 403);
    }

    // Backfill a handle for legacy accounts created before handles existed.
    if (!user.handle) {
      user.handle = await generateUniqueHandle(User, user.email.split("@")[0]);
      await user.save();
    }

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
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
