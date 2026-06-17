const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { success, error } = require("../utils/response");

router.post("/saved-listings/:listingId", auth, async (req, res) => {
  try {
    const { listingId } = req.params;

    const index = req.user.savedListings.findIndex(
      (id) => id.toString() === listingId
    );

    if (index > -1) {
      req.user.savedListings.splice(index, 1);
    } else {
      req.user.savedListings.push(listingId);
    }

    await req.user.save();

    return success(res, req.user.savedListings);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
