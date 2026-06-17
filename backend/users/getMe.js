const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { success } = require("../utils/response");
const { generateUniqueHandle } = require("../utils/handle");

router.get("/me", auth, async (req, res) => {
  // Lazy-backfill a handle for legacy accounts.
  if (!req.user.handle) {
    req.user.handle = await generateUniqueHandle(
      User,
      req.user.email.split("@")[0]
    );
    await req.user.save();
  }
  return success(res, {
    id: req.user._id,
    email: req.user.email,
    displayName: req.user.displayName,
    handle: req.user.handle,
    phone: req.user.phone,
    bio: req.user.bio,
    location: req.user.location,
    avatarUrl: req.user.avatarUrl,
    university: req.user.university,
  });
});

module.exports = router;
