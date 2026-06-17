const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const StudyGroup = require("../models/StudyGroup");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");

/**
 * POST /api/study-groups
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      name,
      description,
      subject,
      tags,
      image,
      maxMembers,
      nextSessionAt,
      nextSession,
      links,
      customLinks,
    } = req.body;

    if (!name || !subject) {
      return error(res, "Name and subject are required", 400);
    }

    const normalizedNextSession = {
      ...(nextSession || {}),
    };

    if (nextSessionAt) {
      normalizedNextSession.at = nextSessionAt;
    }

    if (!normalizedNextSession.at) {
      delete normalizedNextSession.at;
    }

    const group = await StudyGroup.create({
      name,
      description,
      subject,
      tags,
      image,
      maxMembers,
      nextSession:
        Object.keys(normalizedNextSession).length > 0
          ? normalizedNextSession
          : undefined,
      links,
      customLinks,
      creator: req.user._id,
      members: [req.user._id],
      university: req.user.university,
    });

    await createNotification(
      req.user._id,
      "study-group",
      "Study group created",
      `Your group "${group.name}" is live.`,
      group._id,
      "StudyGroup"
    );

    return success(res, group, "Study group created", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
