const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const LostFoundItem = require("../../models/LostFoundItem");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/lost-found/:id
 */
router.delete("/:id", auth, universityScope(LostFoundItem), async (req, res, next) => {
  try {
    const item = req.resource;

    if (!item || !item.isActive) {
      return error(res, "Item not found or not authorized", 404);
    }

    if (item.reporter.toString() !== req.user._id.toString()) {
      return error(res, "Item not found or not authorized", 404);
    }

    item.isActive = false;
    await item.save();

    return success(res, null, "Item removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
