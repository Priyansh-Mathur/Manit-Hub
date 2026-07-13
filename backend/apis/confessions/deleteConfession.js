const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Confession = require("../../models/Confession");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/confessions/:id  (author only)
 */
router.delete("/:id", auth, universityScope(Confession), async (req, res, next) => {
  try {
    const confession = req.resource;

    if (
      !confession.isActive ||
      confession.author.toString() !== req.user._id.toString()
    ) {
      return error(res, "Confession not found or not authorized", 404);
    }

    confession.isActive = false;
    await confession.save();

    return success(res, null, "Confession deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
