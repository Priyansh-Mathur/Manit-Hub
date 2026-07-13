const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Notification = require("../../models/Notification");
const { success, error } = require("../../utils/response");

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!notification) {
      return error(res, "Notification not found", 404);
    }

    return success(res, null, "Notification deleted");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
