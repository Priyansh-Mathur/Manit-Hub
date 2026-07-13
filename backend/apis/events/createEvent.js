const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Event = require("../../models/Event");
const { success, error } = require("../../utils/response");
const { awardPoints } = require("../../utils/gamification");
const POPULATE = require("./populate");
const serializeEvent = require("./serializeEvent");

/**
 * POST /api/events
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, description, club, category, venue, startAt, endAt } =
      req.body;

    if (!title || !category || !startAt) {
      return error(res, "Missing required fields", 400);
    }

    const start = new Date(startAt);
    if (Number.isNaN(start.getTime()) || start < new Date()) {
      return error(res, "Event must start in the future", 400);
    }

    let end;
    if (endAt) {
      end = new Date(endAt);
      if (Number.isNaN(end.getTime()) || end <= start) {
        return error(res, "Event must end after it starts", 400);
      }
    }

    const event = await Event.create({
      title,
      description,
      club,
      category,
      venue,
      startAt: start,
      endAt: end,
      organizer: req.user._id,
      university: req.user.university,
    });
    await event.populate(POPULATE);

    await awardPoints(req.user._id, "event_created");

    return success(res, serializeEvent(event, req.user._id), "Event created", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
