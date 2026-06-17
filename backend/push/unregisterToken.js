const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const DeviceToken = require("../models/DeviceToken");
const { success, error } = require("../utils/response");

/**
 * POST /api/push/unregister  { token }
 */
router.post("/unregister", auth, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return error(res, "Device token required", 400);

    await DeviceToken.deleteOne({ token, user: req.user._id });

    return success(res, null, "Device unregistered");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
