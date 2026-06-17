const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Document = require("../models/Document");
const { success, error } = require("../utils/response");

/**
 * POST /api/documents/:id/download
 */
router.post("/:id/download", auth, universityScope(Document), async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    document.downloadCount += 1;
    await document.save();

    return success(res, {
      fileUrl: document.fileUrl,
      downloadCount: document.downloadCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
