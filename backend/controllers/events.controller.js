const Event = require("../models/Event");
const { success, error } = require("../utils/response");
const { awardPoints } = require("../utils/gamification");

const POPULATE = [
  { path: "organizer", select: "displayName avatarUrl" },
  { path: "attendees", select: "displayName avatarUrl" },
];

const serializeEvent = (event, viewerId) => {
  const data = event.toObject();
  data.attendeeCount = event.attendees.length;
  data.myRsvp = event.attendees.some(
    (a) => (a._id || a).toString() === viewerId.toString()
  );
  // keep a small avatar strip, not the whole list
  data.attendees = data.attendees.slice(0, 5);
  return data;
};

/**
 * GET /api/events
 */
exports.getEvents = async (req, res, next) => {
  try {
    const {
      filter = "upcoming",
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;
    const safeLimit = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * safeLimit;

    const query = {
      university: req.user.university,
      isActive: true,
    };

    const now = new Date();
    let sort = { startAt: 1 };
    if (filter === "past") {
      query.startAt = { $lt: now };
      sort = { startAt: -1 };
    } else if (filter === "mine") {
      query.$or = [
        { organizer: req.user._id },
        { attendees: req.user._id },
      ];
      sort = { startAt: -1 };
    } else {
      query.startAt = { $gte: now };
    }

    if (category && category !== "All") query.category = category;

    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { club: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const [events, total] = await Promise.all([
      Event.find(query).populate(POPULATE).sort(sort).skip(skip).limit(safeLimit),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events.map((e) => serializeEvent(e, req.user._id)),
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events
 */
exports.createEvent = async (req, res, next) => {
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
};

/**
 * POST /api/events/:id/rsvp — toggle the viewer's RSVP.
 */
exports.toggleRsvp = async (req, res, next) => {
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
};

/**
 * DELETE /api/events/:id  (organizer only)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = req.resource;

    if (
      !event.isActive ||
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return error(res, "Event not found or not authorized", 404);
    }

    event.isActive = false;
    await event.save();

    return success(res, null, "Event removed");
  } catch (err) {
    next(err);
  }
};
