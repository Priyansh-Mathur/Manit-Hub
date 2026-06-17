const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const LostFoundItem = require("../models/LostFoundItem");
const { success, error } = require("../utils/response");

/**
 * PATCH /api/lost-found/:id/status
 * Reporter marks their item as returned (or reopens it).
 */
router.patch("/:id/status", auth, universityScope(LostFoundItem), async (req, res, next) => {
  try {
    const item = req.resource;

    if (!item || !item.isActive) {
      return error(res, "Item not found", 404);
    }

    if (item.reporter.toString() !== req.user._id.toString()) {
      return error(res, "Item not found or not authorized", 404);
    }

    const { status } = req.body;
    if (!["open", "returned"].includes(status)) {
      return error(res, "Invalid status", 400);
    }

    item.status = status;
    await item.save();
    await item.populate("reporter", "displayName avatarUrl");

    return success(res, item, "Status updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
