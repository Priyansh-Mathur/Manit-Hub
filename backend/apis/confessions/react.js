const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Confession = require("../../models/Confession");
const { REACTION_TYPES } = require("../../models/Confession");
const { success, error } = require("../../utils/response");
const serializeConfession = require("./serializeConfession");

/**
 * POST /api/confessions/:id/react  { type }
 * Toggles the viewer's reaction; switching type replaces the old one.
 */
router.post("/:id/react", auth, universityScope(Confession), async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive || confession.isHidden) {
      return error(res, "Confession not found", 404);
    }

    const { type } = req.body;
    if (!REACTION_TYPES.includes(type)) {
      return error(res, "Unknown reaction", 400);
    }

    const existing = confession.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existing && existing.type === type) {
      confession.reactions = confession.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
    } else if (existing) {
      existing.type = type;
    } else {
      confession.reactions.push({ user: req.user._id, type });
    }

    confession.reactionsCount = confession.reactions.length;
    await confession.save();

    return success(res, serializeConfession(confession, req.user._id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
