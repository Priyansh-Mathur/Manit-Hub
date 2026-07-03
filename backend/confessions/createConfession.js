const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Confession = require("../models/Confession");
const { success, error } = require("../utils/response");
const { awardPoints } = require("../utils/gamification");
const { isClean } = require("../utils/contentFilter");
const serializeConfession = require("./serializeConfession");

/**
 * POST /api/confessions
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return error(res, "Confession can't be empty", 400);
    }
    if (content.trim().length > 1000) {
      return error(res, "Keep it under 1000 characters", 400);
    }
    if (!isClean(content)) {
      return error(res, "Your post contains language that isn't allowed", 400);
    }

    const confession = await Confession.create({
      content: content.trim(),
      author: req.user._id,
      university: req.user.university,
    });

    await awardPoints(req.user._id, "confession_posted");

    return success(
      res,
      serializeConfession(confession, req.user._id),
      "Confessed — anonymously",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
