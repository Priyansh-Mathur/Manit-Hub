const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const Document = require("../../models/Document");
const { success, error } = require("../../utils/response");

/**
 * DELETE /api/documents/:id
 */
router.delete("/:id", auth, universityScope(Document), async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found or not authorized", 404);
    }

    if (document.uploader.toString() !== req.user._id.toString()) {
      return error(res, "Document not found or not authorized", 404);
    }

    document.isActive = false;
    await document.save();

    return success(res, null, "Document deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
