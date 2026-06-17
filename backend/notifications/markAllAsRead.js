const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");
const { success, error } = require("../utils/response");

router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    return success(res, null, "All notifications marked as read");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
