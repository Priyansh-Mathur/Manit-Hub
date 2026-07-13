const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Listing = require("../../models/Listing");
const { success, error } = require("../../utils/response");
const { isClean } = require("../../utils/contentFilter");

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

    // Whitelist editable fields. Never let the client set seller/university/
    // isActive/timestamps via the body — a raw Object.assign(listing, req.body)
    // would let an owner move their listing to another campus or reassign it.
    const EDITABLE = [
      "title",
      "description",
      "price",
      "category",
      "images",
      "condition",
      "status",
    ];
    for (const key of EDITABLE) {
      if (req.body[key] !== undefined) listing[key] = req.body[key];
    }

    if (Array.isArray(listing.images) && listing.images.length > 6) {
      return error(res, "A listing can have at most 6 images", 400);
    }
    if (!isClean(listing.title) || !isClean(listing.description)) {
      return error(res, "Your listing contains language that isn't allowed", 400);
    }

    await listing.save();

    return success(res, listing);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
