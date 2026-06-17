const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Confession = require("../models/Confession");
const { success, error } = require("../utils/response");

const REPORT_AUTO_HIDE_THRESHOLD = 5;

/**
 * POST /api/confessions/:id/report  { reason }
 */
router.post("/:id/report", auth, universityScope(Confession), async (req, res, next) => {
  try {
    const confession = req.resource;
    if (!confession.isActive) {
      return error(res, "Confession not found", 404);
    }

    const alreadyReported = confession.reports.some(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReported) {
      return error(res, "You already reported this confession", 400);
    }

    confession.reports.push({
      user: req.user._id,
      reason: (req.body.reason || "").trim().slice(0, 300),
    });

    if (confession.reports.length >= REPORT_AUTO_HIDE_THRESHOLD) {
      confession.isHidden = true;
    }

    await confession.save();

    return success(res, null, "Reported — thanks for keeping the feed safe");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
