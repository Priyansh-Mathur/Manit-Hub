const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const confessionsController = require("../controllers/confessions.controller");
const universityScope = require("../middleware/universityScope");
const Confession = require("../models/Confession");

router.get("/", auth, confessionsController.getConfessions);
router.post("/", auth, confessionsController.createConfession);
router.post(
  "/:id/react",
  auth,
  universityScope(Confession),
  confessionsController.react
);
router.post(
  "/:id/comments",
  auth,
  universityScope(Confession),
  confessionsController.addComment
);
router.post(
  "/:id/report",
  auth,
  universityScope(Confession),
  confessionsController.report
);
router.delete(
  "/:id",
  auth,
  universityScope(Confession),
  confessionsController.deleteConfession
);

module.exports = router;
