const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * PUT /api/listings/:id
 */
router.put("/:id", auth, universityScope(Listing), async (req, res, next) => {
  try {
    const listing = req.resource;

    if (!listing || !listing.isActive) {
      return error(res, "Listing not found or not authorized", 404);
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return error(res, "Listing not found or not authorized", 404);
    }

    Object.assign(listing, req.body);
    await listing.save();

    return success(res, listing);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
