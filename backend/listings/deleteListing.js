const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * DELETE /api/listings/:id
 */
router.delete("/:id", auth, universityScope(Listing), async (req, res, next) => {
  try {
    const listing = req.resource;

    if (!listing || !listing.isActive) {
      return error(res, "Listing not found or not authorized", 404);
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return error(res, "Listing not found or not authorized", 404);
    }

    listing.isActive = false;
    await listing.save();

    return success(res, null, "Listing deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
