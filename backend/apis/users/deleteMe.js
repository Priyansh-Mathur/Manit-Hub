const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Listing = require("../../models/Listing");
const { success } = require("../../utils/response");

/**
 * DELETE /api/users/me
 */
router.delete("/me", auth, async (req, res, next) => {
  try {
    await Listing.deleteMany({ seller: req.user._id });
    await req.user.deleteOne();

    return success(res, null, "Account deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
