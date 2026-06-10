const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const academicRecordsController = require("../controllers/academicRecords.controller");

// Records are keyed to the logged-in user (and their university),
// so every route is intrinsically scoped — no cross-user :id lookups.
router.get("/", auth, academicRecordsController.getRecords);
router.put("/:semester", auth, academicRecordsController.upsertSemester);
router.delete("/:semester", auth, academicRecordsController.deleteSemester);

module.exports = router;
