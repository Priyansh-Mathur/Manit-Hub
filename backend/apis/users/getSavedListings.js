const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Listing = require("../../models/Listing");
const { success } = require("../../utils/response");

/**
 * GET /api/users/me/saved-listings
 */
router.get("/me/saved-listings", auth, async (req, res, next) => {
  try {
    const listings = await Listing.find({
      _id: { $in: req.user.savedListings },
      university: req.user.university,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("seller", "displayName avatarUrl");

    return success(res, listings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
