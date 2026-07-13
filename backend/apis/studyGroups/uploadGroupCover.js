const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const uploadStudyGroupCover = require("../../middleware/uploadStudyGroupCover");
const StudyGroup = require("../../models/StudyGroup");
const { success, error } = require("../../utils/response");

/**
 * POST /api/study-groups/:id/cover
 */
router.post(
  "/:id/cover",
  auth,
  universityScope(StudyGroup),
  uploadStudyGroupCover.single("cover"),
  async (req, res, next) => {
    try {
      const group = req.resource;

      if (!group || !group.isActive) {
        return error(res, "Study group not found", 404);
      }

      if (group.creator.toString() !== req.user._id.toString()) {
        return error(res, "Only the creator can update the cover", 403);
      }

      if (!req.file) {
        return error(res, "No image uploaded", 400);
      }

      group.image = req.file.path;
      await group.save();

      return success(res, group, "Cover image updated");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
