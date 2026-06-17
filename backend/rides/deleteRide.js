const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Ride = require("../models/Ride");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");

/**
 * DELETE /api/rides/:id  (poster only)
 */
router.delete("/:id", auth, universityScope(Ride), async (req, res, next) => {
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
});

module.exports = router;
