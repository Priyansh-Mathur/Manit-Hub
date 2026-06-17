const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Event = require("../models/Event");
const { success, error } = require("../utils/response");
const POPULATE = require("./populate");
const serializeEvent = require("./serializeEvent");

/**
 * POST /api/events/:id/rsvp — toggle the viewer's RSVP.
 */
router.post("/:id/rsvp", auth, universityScope(Event), async (req, res, next) => {
  try {
    const event = req.resource;

    if (!event.isActive) return error(res, "Event not found", 404);
    if (event.startAt < new Date()) {
      return error(res, "This event already started", 400);
    }

    const viewer = req.user._id.toString();
    const going = event.attendees.some((a) => a.toString() === viewer);

    if (going) {
      event.attendees = event.attendees.filter((a) => a.toString() !== viewer);
    } else {
      event.attendees.push(req.user._id);
    }
    await event.save();
    await event.populate(POPULATE);

    return success(
      res,
      serializeEvent(event, req.user._id),
      going ? "RSVP removed" : "You're going 🎉"
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
