const Ride = require("../models/Ride");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");
const { awardPoints } = require("../utils/gamification");

const POPULATE = [
  { path: "poster", select: "displayName avatarUrl" },
  { path: "passengers", select: "displayName avatarUrl" },
];

/**
 * GET /api/rides
 */
exports.getRides = async (req, res, next) => {
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
};

/**
 * POST /api/rides
 */
exports.createRide = async (req, res, next) => {
  try {
    const { from, to, departureAt, seatsTotal, note } = req.body;

    if (!from || !to || !departureAt || !seatsTotal) {
      return error(res, "Missing required fields", 400);
    }

    const departure = new Date(departureAt);
    if (Number.isNaN(departure.getTime()) || departure < new Date()) {
      return error(res, "Departure must be in the future", 400);
    }

    const seats = Number(seatsTotal);
    if (!seats || seats < 1 || seats > 8) {
      return error(res, "Seats must be between 1 and 8", 400);
    }

    const ride = await Ride.create({
      from,
      to,
      departureAt: departure,
      seatsTotal: seats,
      note,
      poster: req.user._id,
      university: req.user.university,
    });
    await ride.populate(POPULATE);

    await awardPoints(req.user._id, "ride_posted");

    return success(res, ride, "Ride posted", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rides/:id/join
 */
exports.joinRide = async (req, res, next) => {
  try {
    const ride = req.resource;

    if (!ride.isActive) return error(res, "Ride not found", 404);
    if (ride.departureAt < new Date()) {
      return error(res, "This ride already departed", 400);
    }
    if (ride.poster.toString() === req.user._id.toString()) {
      return error(res, "You posted this ride", 400);
    }
    if (ride.passengers.some((p) => p.toString() === req.user._id.toString())) {
      return error(res, "You already joined this ride", 400);
    }
    if (ride.passengers.length >= ride.seatsTotal) {
      return error(res, "No seats left", 400);
    }

    ride.passengers.push(req.user._id);
    await ride.save();
    await ride.populate(POPULATE);

    await createNotification(
      ride.poster._id,
      "system",
      "New co-passenger 🚕",
      `${req.user.displayName} joined your ride ${ride.from} → ${ride.to}.`,
      null,
      null
    );

    return success(res, ride, "Seat booked — coordinate in chat");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rides/:id/leave
 */
exports.leaveRide = async (req, res, next) => {
  try {
    const ride = req.resource;

    if (!ride.isActive) return error(res, "Ride not found", 404);

    const before = ride.passengers.length;
    ride.passengers = ride.passengers.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (ride.passengers.length === before) {
      return error(res, "You haven't joined this ride", 400);
    }

    await ride.save();
    await ride.populate(POPULATE);

    await createNotification(
      ride.poster._id,
      "system",
      "A passenger left your ride",
      `${req.user.displayName} left your ride ${ride.from} → ${ride.to}.`,
      null,
      null
    );

    return success(res, ride, "You left the ride");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/rides/:id  (poster only)
 */
exports.deleteRide = async (req, res, next) => {
  try {
    const ride = req.resource;

    if (
      !ride.isActive ||
      ride.poster.toString() !== req.user._id.toString()
    ) {
      return error(res, "Ride not found or not authorized", 404);
    }

    ride.isActive = false;
    await ride.save();

    // Tell everyone who had a seat.
    await Promise.all(
      ride.passengers.map((passenger) =>
        createNotification(
          passenger,
          "system",
          "Ride cancelled",
          `The ride ${ride.from} → ${ride.to} was cancelled by the poster.`,
          null,
          null
        )
      )
    );

    return success(res, null, "Ride removed");
  } catch (err) {
    next(err);
  }
};
