const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Listing = require("../models/Listing");
const { success } = require("../utils/response");

router.get("/me", auth, async (req, res, next) => {
  try {
    const listings = await Listing.find({
      seller: req.user._id,
      isActive: true,
      university: req.user.university,
    }).sort({ createdAt: -1 });

    return success(res, listings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
