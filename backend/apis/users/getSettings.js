const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { success, error } = require("../../utils/response");

router.get("/settings", auth, async (req, res) => {
  try {
    return success(res, {
      notificationPreferences: req.user.notificationPreferences,
      privacySettings: req.user.privacySettings,
      paymentInfo: req.user.paymentInfo
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
