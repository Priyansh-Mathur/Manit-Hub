const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Ride = require("../models/Ride");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const POPULATE = require("./populate");

/**
 * POST /api/rides/:id/leave
 */
router.post("/:id/leave", auth, universityScope(Ride), async (req, res, next) => {
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
});

module.exports = router;
