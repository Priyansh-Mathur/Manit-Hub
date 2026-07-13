const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { success, error } = require("../../utils/response");
const { isValidHandle } = require("../../utils/handle");
const { isEmailConfigured, sendMail } = require("../../utils/mailer");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../../utils/email");

router.put("/me", auth, async (req, res) => {
  try {
    const { displayName, email, phone, bio, location, handle } = req.body;

    if (displayName !== undefined) req.user.displayName = displayName;
    if (phone !== undefined) req.user.phone = phone;
    if (bio !== undefined) req.user.bio = bio;
    if (location !== undefined) req.user.location = location;

    if (handle !== undefined) {
      const next = String(handle).toLowerCase().trim();
      if (next !== req.user.handle) {
        if (!isValidHandle(next)) {
          return error(
            res,
            "Handle must be 3–20 chars: letters, numbers, . or _",
            400
          );
        }
        const taken = await User.exists({
          handle: next,
          _id: { $ne: req.user._id },
        });
        if (taken) return error(res, "That handle is taken", 400);
        req.user.handle = next;
      }
    }

    // Track whether the email changed so we can force re-verification below.
    let emailChanged = false;

    if (email !== undefined) {
      // Coerce to a string first — otherwise a body like {"email":{"$ne":null}}
      // would flow into the query as a Mongo operator (NoSQL injection).
      const nextEmail = normalizeEmail(email);

      if (nextEmail !== req.user.email) {
        // New email must be a valid MANIT scholar address — same rule as signup.
        if (!isValidScholarEmail(nextEmail)) {
          return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
        }

        const existingUser = await User.findOne({
          email: nextEmail,
          _id: { $ne: req.user._id },
        });

        if (existingUser) {
          return error(res, "Email already in use", 400);
        }

        req.user.email = nextEmail;
        emailChanged = true;
      }
    }

    // Changing your email means you must prove you own the new address before
    // it counts as verified. With SMTP configured, send a fresh code and mark
    // the account unverified; without SMTP, behaviour is unchanged.
    let verificationCode = null;
    if (emailChanged && isEmailConfigured()) {
      verificationCode = crypto.randomInt(100000, 1000000).toString();
      req.user.emailVerified = false;
      req.user.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");
      req.user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
    }

    await req.user.save();

    if (verificationCode) {
      await sendMail({
        to: req.user.email,
        subject: "Manit Hub — verify your new email",
        text: `You changed your Manit Hub email.\n\nYour verification code is: ${verificationCode}\n\nIt expires in 30 minutes.`,
      });
    }

    return success(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        handle: req.user.handle,
        phone: req.user.phone,
        bio: req.user.bio,
        location: req.user.location,
        avatarUrl: req.user.avatarUrl,
        university: req.user.university,
      },
    }, "Profile updated successfully");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
