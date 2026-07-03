const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");
const { success, error } = require("../utils/response");
const { maybeAutoHide } = require("../utils/moderation");
const TARGETS = require("./targets");

/**
 * POST /api/reports  { targetType, targetId, reason }
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;

    const target = TARGETS[targetType];
    if (!target || !targetId) {
      return error(res, "Invalid report target", 400);
    }
    if (!reason || !reason.trim()) {
      return error(res, "A reason is required", 400);
    }

    const doc = await target.model().findById(targetId);
    if (!doc) {
      return error(res, "Content not found", 404);
    }
    if (doc.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    const existing = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
    });
    if (existing) {
      return error(res, "You already reported this content", 400);
    }

    const report = await Report.create({
      reporter: req.user._id,
      university: req.user.university,
      targetType,
      targetId,
      reason: reason.trim(),
      snapshot: target.snapshot(doc),
    });

    // Auto-hide the content (and strike its author) once enough distinct users
    // have reported it, so it disappears before a moderator can review it.
    await maybeAutoHide(targetType, targetId);

    return success(res, report, "Reported — a moderator will review it", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
