const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const attendanceController = require("../controllers/attendance.controller");
const universityScope = require("../middleware/universityScope");
const AttendanceSubject = require("../models/AttendanceSubject");

router.get("/", auth, attendanceController.getSubjects);
router.post("/", auth, attendanceController.createSubject);
router.patch(
  "/:id",
  auth,
  universityScope(AttendanceSubject),
  attendanceController.updateSubject
);
router.delete(
  "/:id",
  auth,
  universityScope(AttendanceSubject),
  attendanceController.deleteSubject
);

module.exports = router;
