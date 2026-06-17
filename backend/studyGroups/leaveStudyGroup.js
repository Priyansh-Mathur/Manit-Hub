const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const StudyGroup = require("../models/StudyGroup");
const { success, error } = require("../utils/response");

/**
 * POST /api/study-groups/:id/leave
 */
router.post("/:id/leave", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const group = req.resource;

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    if (group.creator.toString() === req.user._id.toString()) {
      return error(res, "Creator cannot leave the group", 400);
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return error(res, "Not a member of this group", 400);
    }

    group.members = group.members.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await group.save();

    return success(res, null, "Left study group");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
