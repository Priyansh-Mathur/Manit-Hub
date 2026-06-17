const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");
const { resolveUniversityByEmail } = require("../utils/universities");
const { generateUniqueHandle } = require("../utils/handle");

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return error(res, "All fields are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, "Email already in use", 400);
    }

    const university = await resolveUniversityByEmail(email);

    const handle = await generateUniqueHandle(User, email.split("@")[0]);

    const user = await User.create({
      email,
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
