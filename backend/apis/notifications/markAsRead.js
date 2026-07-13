const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Notification = require("../../models/Notification");
const { success, error } = require("../../utils/response");

router.put("/:id/read", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return error(res, "Notification not found", 404);
    }

    return success(res, notification, "Notification marked as read");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
