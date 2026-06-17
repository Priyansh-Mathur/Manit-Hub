const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * PATCH /api/listings/:id/status
 */
router.patch("/:id/status", auth, universityScope(Listing), async (req, res, next) => {
  try {
    const listing = req.resource;

    if (!listing || !listing.isActive) {
      return error(res, "Listing not found or not authorized", 404);
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return error(res, "Listing not found or not authorized", 404);
    }

    const { status } = req.body;
    const allowed = ["available", "sold", "reserved"];

    if (!allowed.includes(status)) {
      return error(res, "Invalid status", 400);
    }

    listing.status = status;
    await listing.save();

    return success(res, listing, "Listing status updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
