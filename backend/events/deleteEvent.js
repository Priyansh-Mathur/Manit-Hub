const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Event = require("../models/Event");
const { success, error } = require("../utils/response");

/**
 * DELETE /api/events/:id  (organizer only)
 */
router.delete("/:id", auth, universityScope(Event), async (req, res, next) => {
  try {
    const event = req.resource;

    if (
      !event.isActive ||
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return error(res, "Event not found or not authorized", 404);
    }

    event.isActive = false;
    await event.save();

    return success(res, null, "Event removed");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
