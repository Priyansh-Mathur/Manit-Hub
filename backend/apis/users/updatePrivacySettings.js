const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { success, error } = require("../../utils/response");

router.put("/privacy-settings", auth, async (req, res) => {
  try {
    const { profileVisibility, showOnlineStatus, allowDirectMessages } = req.body;

    if (profileVisibility !== undefined) req.user.privacySettings.profileVisibility = profileVisibility;
    if (showOnlineStatus !== undefined) req.user.privacySettings.showOnlineStatus = showOnlineStatus;
    if (allowDirectMessages !== undefined) req.user.privacySettings.allowDirectMessages = allowDirectMessages;

    await req.user.save();

    return success(res, req.user.privacySettings, "Privacy settings updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
