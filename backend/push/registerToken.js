const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const DeviceToken = require("../models/DeviceToken");
const { success, error } = require("../utils/response");

/**
 * POST /api/push/register  { token, platform }
 */
router.post("/register", auth, async (req, res, next) => {
  try {
    const { token, platform = "web" } = req.body;

    if (!token || typeof token !== "string") {
      return error(res, "Device token required", 400);
    }

    // Re-registering moves the token to the current user (shared devices).
    await DeviceToken.findOneAndUpdate(
      { token },
      {
        token,
        platform,
        user: req.user._id,
        university: req.user.university,
      },
      { upsert: true, new: true }
    );

    return success(res, null, "Device registered for push");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
