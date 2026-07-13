const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Notification = require("../../models/Notification");
const { success, error } = require("../../utils/response");

router.get("/", auth, async (req, res) => {
  try {
    const { type, read, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };
    if (type && type !== 'all') query.type = type;
    if (read !== undefined) query.read = read === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, read: false })
    ]);

    return success(res, {
      notifications,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
