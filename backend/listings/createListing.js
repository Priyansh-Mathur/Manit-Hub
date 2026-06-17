const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const { awardPoints } = require("../utils/gamification");

/**
 * POST /api/listings
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category,
      images,
      condition,
      status,
    } = req.body;

    if (!title || !price || !category) {
      return error(res, "Missing required fields", 400);
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      images,
      condition,
      status,
      seller: req.user._id,
      university: req.user.university,
    });

    // Create notification for the user
    await createNotification(
      req.user._id,
      "marketplace",
      "Listing Created",
      `Your listing "${title}" has been posted successfully`,
      listing._id,
      "Listing"
    );

    await awardPoints(req.user._id, "listing_created");

    return success(res, listing, "Listing created", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
