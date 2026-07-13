const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const StudyGroup = require("../../models/StudyGroup");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");

/**
 * POST /api/study-groups/:id/join
 */
router.post("/:id/join", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const group = req.resource;

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (isMember) {
      return error(res, "Already a member", 400);
    }

    if (group.members.length >= group.maxMembers) {
      return error(res, "Group is full", 400);
    }

    group.members.push(req.user._id);
    await group.save();

    // Notify the group creator that someone joined.
    if (group.creator && group.creator.toString() !== req.user._id.toString()) {
      await createNotification(
        group.creator,
        "study-group",
        `${req.user.displayName} joined your group`,
        `${req.user.displayName} joined “${group.name}”.`,
        group._id,
        "StudyGroup"
      );
    }

    return success(res, null, "Joined study group");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
