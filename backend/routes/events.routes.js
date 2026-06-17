const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const eventsController = require("../controllers/events.controller");
const universityScope = require("../middleware/universityScope");
const Event = require("../models/Event");

router.get("/", auth, eventsController.getEvents);
router.post("/", auth, eventsController.createEvent);
router.post("/:id/rsvp", auth, universityScope(Event), eventsController.toggleRsvp);
router.delete("/:id", auth, universityScope(Event), eventsController.deleteEvent);

module.exports = router;
