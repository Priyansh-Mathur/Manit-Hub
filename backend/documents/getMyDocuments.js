const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const { success } = require("../utils/response");

/**
 * GET /api/documents/me
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    const documents = await Document.find({
      uploader: req.user._id,
      isActive: true,
      university: req.user.university,
    }).sort({ createdAt: -1 });

    return success(res, documents);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
