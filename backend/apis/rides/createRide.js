const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Ride = require("../../models/Ride");
const { success, error } = require("../../utils/response");
const { awardPoints } = require("../../utils/gamification");
const POPULATE = require("./populate");

/**
 * POST /api/rides
 */
router.post("/", auth, async (req, res, next) => {
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
});

module.exports = router;
