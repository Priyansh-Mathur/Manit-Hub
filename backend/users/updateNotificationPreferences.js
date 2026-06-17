const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { success, error } = require("../utils/response");

router.put("/notification-preferences", auth, async (req, res) => {
  try {
    const { messages, studyGroups, marketplace } = req.body;

    if (messages !== undefined) req.user.notificationPreferences.messages = messages;
    if (studyGroups !== undefined) req.user.notificationPreferences.studyGroups = studyGroups;
    if (marketplace !== undefined) req.user.notificationPreferences.marketplace = marketplace;

    await req.user.save();

    return success(res, req.user.notificationPreferences, "Notification preferences updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
