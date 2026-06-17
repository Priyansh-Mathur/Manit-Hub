const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Offer = require("../models/Offer");
const { success } = require("../utils/response");
const POPULATE = require("./populate");

/**
 * GET /api/offers?role=buyer|seller
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const { role = "buyer", listingId } = req.query;

    const query = { university: req.user.university };
    if (role === "seller") query.seller = req.user._id;
    else query.buyer = req.user._id;
    if (listingId) query.listing = listingId;

    const offers = await Offer.find(query)
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    return success(res, offers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
