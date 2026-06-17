const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Event = require("../models/Event");
const POPULATE = require("./populate");
const serializeEvent = require("./serializeEvent");

/**
 * GET /api/events
 */
router.get("/", auth, async (req, res, next) => {
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
});

module.exports = router;
