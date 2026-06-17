const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const forumController = require("../controllers/forum.controller");
const universityScope = require("../middleware/universityScope");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

// Questions
router.get("/questions", auth, forumController.getQuestions);
router.post("/questions", auth, forumController.createQuestion);
router.get(
  "/questions/:id",
  auth,
  universityScope(Question),
  forumController.getQuestion
);
router.post(
  "/questions/:id/upvote",
  auth,
  universityScope(Question),
  forumController.upvoteQuestion
);
router.post(
  "/questions/:id/answers",
  auth,
  universityScope(Question),
  forumController.addAnswer
);
router.delete(
  "/questions/:id",
  auth,
  universityScope(Question),
  forumController.deleteQuestion
);

// Answers
router.post(
  "/answers/:id/upvote",
  auth,
  universityScope(Answer),
  forumController.upvoteAnswer
);
router.post(
  "/answers/:id/accept",
  auth,
  universityScope(Answer),
  forumController.acceptAnswer
);
router.delete(
  "/answers/:id",
  auth,
  universityScope(Answer),
  forumController.deleteAnswer
);

module.exports = router;
