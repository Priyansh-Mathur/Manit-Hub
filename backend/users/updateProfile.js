const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { success, error } = require("../utils/response");
const { isValidHandle } = require("../utils/handle");

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

    if (email !== undefined && email !== req.user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return error(res, "Email already in use", 400);
      }

      req.user.email = email;
    }

    await req.user.save();

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
