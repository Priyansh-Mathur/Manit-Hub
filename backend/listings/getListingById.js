const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * GET /api/listings/:id
 */
router.get("/:id", auth, universityScope(Listing), async (req, res, next) => {
  try {
    const listing = req.resource;

    if (!listing || !listing.isActive) {
      return error(res, "Listing not found", 404);
    }

    await listing.populate("seller", "displayName avatarUrl");

    return success(res, listing);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
