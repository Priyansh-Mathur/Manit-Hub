const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const TimetableEntry = require("../../models/TimetableEntry");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/timetable/:id
 */
router.delete("/:id", auth, universityScope(TimetableEntry), async (req, res, next) => {
  try {
    const entry = req.resource;

    if (entry.user.toString() !== req.user._id.toString()) {
      return error(res, "Class not found", 404);
    }

    await entry.deleteOne();
    return success(res, null, "Class removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
