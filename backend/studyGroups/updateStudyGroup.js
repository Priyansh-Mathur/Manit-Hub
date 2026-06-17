const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const StudyGroup = require("../models/StudyGroup");
const { success, error } = require("../utils/response");

/**
 * PUT /api/study-groups/:id
 */
router.put("/:id", auth, universityScope(StudyGroup), async (req, res, next) => {
  try {
    const group = req.resource;

    if (!group || !group.isActive) {
      return error(res, "Study group not found", 404);
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return error(res, "Only the creator can edit this group", 403);
    }

    const {
      name,
      description,
      subject,
      tags,
      image,
      maxMembers,
      links,
      customLinks,
      nextSession,
    } = req.body;

    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (subject !== undefined) group.subject = subject;
    if (tags !== undefined) group.tags = tags;
    if (image !== undefined) group.image = image;
    if (maxMembers !== undefined) group.maxMembers = maxMembers;
    if (links !== undefined) group.links = links;
    if (customLinks !== undefined) group.customLinks = customLinks;
    if (nextSession !== undefined) {
      group.nextSession = nextSession;
      group.notifications.sessionReminderSent = false;
    }

    await group.save();

    return success(res, group, "Study group updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
