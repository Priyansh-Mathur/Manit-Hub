const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const uploadListingImages = require("../middleware/uploadListingImages");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");

/**
 * POST /api/listings/:id/images
 */
router.post(
  "/:id/images",
  auth,
  universityScope(Listing),
  uploadListingImages.array("images", 6),
  async (req, res, next) => {
    try {
      const listing = req.resource;

      if (!listing || !listing.isActive) {
        return error(res, "Listing not found or not authorized", 404);
      }

      if (listing.seller.toString() !== req.user._id.toString()) {
        return error(res, "Listing not found or not authorized", 404);
      }

      if (!req.files || req.files.length === 0) {
        return error(res, "No images uploaded", 400);
      }

      const urls = req.files.map((file) => file.path);
      listing.images = [...listing.images, ...urls];
      await listing.save();

      return success(res, listing, "Images uploaded");
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
