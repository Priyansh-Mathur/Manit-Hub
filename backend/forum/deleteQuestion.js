const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Question = require("../models/Question");
const { success, error } = require("../utils/response");

/**
 * DELETE /api/forum/questions/:id  (author only)
 */
router.delete("/questions/:id", auth, universityScope(Question), async (req, res, next) => {
  try {
    const question = req.resource;

    if (
      !question.isActive ||
      question.author.toString() !== req.user._id.toString()
    ) {
      return error(res, "Question not found or not authorized", 404);
    }

    question.isActive = false;
    await question.save();

    return success(res, null, "Question deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
