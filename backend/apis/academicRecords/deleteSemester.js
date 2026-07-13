const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const AcademicRecord = require("../../models/AcademicRecord");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/academic-records/:semester
 */
router.delete("/:semester", auth, async (req, res, next) => {
  try {
    const semester = Number(req.params.semester);
    if (!semester || semester < 1 || semester > 12) {
      return error(res, "Invalid semester", 400);
    }

    const record = await AcademicRecord.findOneAndDelete({
      user: req.user._id,
      semester,
    });

    if (!record) {
      return error(res, "Semester record not found", 404);
    }

    return success(res, null, "Semester removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
