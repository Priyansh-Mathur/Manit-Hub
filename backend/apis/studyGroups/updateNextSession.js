const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const StudyGroup = require("../../models/StudyGroup");
const { success, error } = require("../../utils/response");

/**
 * PUT /api/study-groups/:id/next-session
 */
router.put("/:id/next-session", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const group = req.resource;

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return error(res, "Only the creator can update sessions", 403);
    }

    const { at, mode, location, meetingLink } = req.body;

    if (!at) {
      return error(res, "Session time is required", 400);
    }

    group.nextSession = {
      at,
      mode,
      location,
      meetingLink,
    };
    group.notifications.sessionReminderSent = false;
    await group.save();

    return success(res, group, "Next session updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
