const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Ride = require("../models/Ride");
const POPULATE = require("./populate");

/**
 * GET /api/rides
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const { filter = "upcoming", search, page = 1, limit = 12 } = req.query;
    const safeLimit = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * safeLimit;

    const query = {
      university: req.user.university,
      isActive: true,
    };

    if (filter === "mine") {
      query.$or = [
        { poster: req.user._id },
        { passengers: req.user._id },
      ];
    } else {
      // upcoming — hide rides that already departed
      query.departureAt = { $gte: new Date() };
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { from: { $regex: search, $options: "i" } },
            { to: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const [rides, total] = await Promise.all([
      Ride.find(query)
        .populate(POPULATE)
        .sort({ departureAt: 1 })
        .skip(skip)
        .limit(safeLimit),
      Ride.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: rides,
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
