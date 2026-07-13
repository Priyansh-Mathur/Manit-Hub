const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Ride = require("../../models/Ride");
const { success, error } = require("../../utils/response");
const { createNotification } = require("../../utils/notifications");
const POPULATE = require("./populate");

/**
 * POST /api/rides/:id/join
 */
router.post("/:id/join", auth, universityScope(Ride), async (req, res, next) => {
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
});

module.exports = router;
