const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const StudyGroup = require("../models/StudyGroup");
const { success, error } = require("../utils/response");

/**
 * DELETE /api/study-groups/:id
 */
router.delete("/:id", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const group = req.resource;

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return error(res, "Only the creator can delete this group", 403);
    }

    group.isActive = false;
    await group.save();

    return success(res, null, "Study group deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
