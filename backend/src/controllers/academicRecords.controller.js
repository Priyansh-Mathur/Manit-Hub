const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const AcademicRecord = require("../models/AcademicRecord");
const { success, error } = require("../utils/response");

const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

const validateSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return "Subjects must be a list";

  for (const subject of subjects) {
    if (!subject || typeof subject.name !== "string" || !subject.name.trim()) {
      return "Every subject needs a name";
    }
    const credits = Number(subject.credits);
    if (!credits || Number.isNaN(credits) || credits < 0.5 || credits > 30) {
      return "Credits must be between 0.5 and 30";
    }
    if (!GRADES.includes(subject.grade)) {
      return "Invalid grade";
    }
  }
  return null;
};

/**
 * PUT /api/academic-records/:semester
 * Upserts the semester record for the logged-in user.
 */
router.put("/:semester", auth, async (req, res, next) => {
  try {
    const semester = Number(req.params.semester);
    if (!semester || semester < 1 || semester > 12) {
      return error(res, "Invalid semester", 400);
    }

    const { subjects = [] } = req.body;
    const validationError = validateSubjects(subjects);
    if (validationError) {
      return error(res, validationError, 400);
    }

    const record = await AcademicRecord.findOneAndUpdate(
      { user: req.user._id, semester },
      {
        $set: {
          subjects: subjects.map((s) => ({
            name: s.name.trim(),
            credits: Number(s.credits),
            grade: s.grade,
          })),
        },
        $setOnInsert: {
          user: req.user._id,
          university: req.user.university,
          semester,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return success(res, record, "Semester saved");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
