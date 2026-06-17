const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Offer = require("../models/Offer");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const POPULATE = require("./populate");
const formatINR = require("./formatINR");

/**
 * POST /api/offers  { listingId, amount, message }
 */
router.post("/", auth, async (req, res, next) => {
  try {
    const { listingId, amount, message } = req.body;

    const numericAmount = Number(amount);
    if (!listingId || !numericAmount || numericAmount < 1) {
      return error(res, "A valid offer amount is required", 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive || listing.status === "sold") {
      return error(res, "Listing not available", 404);
    }
    if (listing.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }
    if (listing.seller.toString() === req.user._id.toString()) {
      return error(res, "You can't make an offer on your own listing", 400);
    }

    const existing = await Offer.findOne({
      listing: listing._id,
      buyer: req.user._id,
      status: { $in: ["pending", "countered"] },
    });
    if (existing) {
      return error(res, "You already have an active offer on this listing", 400);
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      university: req.user.university,
      amount: numericAmount,
      message,
    });
    await offer.populate(POPULATE);

    await createNotification(
      listing.seller,
      "marketplace",
      `New offer: ${formatINR(numericAmount)}`,
      `${req.user.displayName} made an offer on “${listing.title}”.`,
      listing._id,
      "Listing"
    );

    return success(res, offer, "Offer sent", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
