const express = require("express");
const router = express.Router();
const University = require("../models/University");
const { success } = require("../utils/response");

/**
 * GET /api/universities
 * (optional, public, read-only)
 */
router.get("/", async (req, res, next) => {
  try {
    const universities = await University.find({})
      .select("name domains logoUrl country")
      .sort({ name: 1 });

    return success(res, universities);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
