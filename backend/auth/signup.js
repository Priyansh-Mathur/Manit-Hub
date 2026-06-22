const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");
const { resolveUniversityByEmail } = require("../utils/universities");
const { generateUniqueHandle } = require("../utils/handle");
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

    const user = await User.create({
      email: normalizedEmail,
      password,
      displayName,
      handle,
      university: university._id,
    });

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
