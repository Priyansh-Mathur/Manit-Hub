const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const StudyGroup = require("../../models/StudyGroup");
const { success, error } = require("../../utils/response");

/**
 * GET /api/study-groups/:id
 */
router.get("/:id", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const groupId = req.resource._id;

    const group = await StudyGroup.findById(groupId)
      .populate("creator", "displayName avatar email")
      .populate("members", "displayName avatar email");

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    return success(res, group);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
