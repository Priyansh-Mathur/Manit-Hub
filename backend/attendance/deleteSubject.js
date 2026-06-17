const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const AttendanceSubject = require("../models/AttendanceSubject");
const { success, error } = require("../utils/response");
const ownedByUser = require("./ownedByUser");

/**
 * DELETE /api/attendance/:id
 */
router.delete("/:id", auth, universityScope(AttendanceSubject), async (req, res, next) => {
  try {
    const subject = req.resource;

    if (!ownedByUser(subject, req.user._id)) {
      return error(res, "Subject not found", 404);
    }

    await subject.deleteOne();
    return success(res, null, "Subject removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
