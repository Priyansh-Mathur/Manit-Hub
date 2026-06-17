const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const universityScope = require("../middleware/universityScope");
const reportsController = require("../controllers/reports.controller");
const Report = require("../models/Report");

router.post("/", auth, reportsController.createReport);
router.get("/", auth, isAdmin, reportsController.getReports);
router.patch(
  "/:id",
  auth,
  isAdmin,
  universityScope(Report),
  reportsController.handleReport
);

module.exports = router;
