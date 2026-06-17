const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const timetableController = require("../controllers/timetable.controller");
const universityScope = require("../middleware/universityScope");
const TimetableEntry = require("../models/TimetableEntry");

router.get("/", auth, timetableController.getEntries);
router.post("/", auth, timetableController.createEntry);
router.put(
  "/:id",
  auth,
  universityScope(TimetableEntry),
  timetableController.updateEntry
);
router.delete(
  "/:id",
  auth,
  universityScope(TimetableEntry),
  timetableController.deleteEntry
);

module.exports = router;
