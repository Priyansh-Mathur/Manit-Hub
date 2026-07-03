const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");
const { resolveUniversityByEmail } = require("../utils/universities");
const { generateUniqueHandle } = require("../utils/handle");
const { isEmailConfigured, sendMail } = require("../utils/mailer");
const {
  isValidScholarEmail,
  normalizeEmail,
  SCHOLAR_EMAIL_MESSAGE,
} = require("../utils/email");

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return error(res, "All fields are required", 400);
    }

    if (!isValidScholarEmail(email)) {
      return error(res, SCHOLAR_EMAIL_MESSAGE, 400);
    }

    if (String(password).length < 8) {
      return error(res, "Password must be at least 8 characters", 400);
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, "Email already in use", 400);
    }

    const university = await resolveUniversityByEmail(normalizedEmail);

    const handle = await generateUniqueHandle(
      User,
      normalizedEmail.split("@")[0]
    );

    // With SMTP configured, prove the person owns this scholar email before
    // letting them in (stops impersonation by registering someone else's
    // scholar number). Without SMTP, signup works exactly as before.
    const requireVerification = isEmailConfigured();

    let verificationCode = null;
    const userFields = {
      email: normalizedEmail,
      password,
      displayName,
      handle,
      university: university._id,
    };

    if (requireVerification) {
      verificationCode = crypto.randomInt(100000, 1000000).toString();
      userFields.emailVerified = false;
      userFields.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");
      userFields.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
    }

    const user = await User.create(userFields);

    if (requireVerification) {
      await sendMail({
        to: normalizedEmail,
        subject: "Manit Hub — verify your email",
        text: `Welcome to Manit Hub!\n\nYour verification code is: ${verificationCode}\n\nIt expires in 30 minutes. If you didn't sign up, you can ignore this email.`,
      });

      return success(
        res,
        { requiresVerification: true, email: normalizedEmail },
        "Verification code sent to your email",
        201
      );
    }

    const token = generateToken(user._id, university._id);

    return success(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          handle: user.handle,
          phone: user.phone,
          bio: user.bio,
          location: user.location,
          avatarUrl: user.avatarUrl,
          university: university,
        },
        token,
      },
      "Signup successful",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
