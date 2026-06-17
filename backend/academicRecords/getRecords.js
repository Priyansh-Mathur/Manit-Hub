const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const AcademicRecord = require("../models/AcademicRecord");
const { success } = require("../utils/response");

/**
 * GET /api/academic-records
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const records = await AcademicRecord.find({
      user: req.user._id,
      university: req.user.university,
    }).sort({ semester: 1 });

    return success(res, records);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
