const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const uploadDocument = require("../../middleware/uploadDocument");
const Document = require("../../models/Document");
const { success, error } = require("../../utils/response");
const { awardPoints } = require("../../utils/gamification");

/**
 * POST /api/documents
 */
router.post("/", auth, uploadDocument.single("file"), async (req, res, next) => {
  try {
    const { title, description, type, branch, subject, semester, year } =
      req.body;

    if (!title || !type) {
      return error(res, "Missing required fields", 400);
    }

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const originalName = req.file.originalname || "";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop().toLowerCase()
      : "";

    const document = await Document.create({
      title,
      description,
      type,
      branch,
      subject,
      semester,
      year: year ? Number(year) : undefined,
      fileUrl: req.file.path,
      fileName: originalName,
      fileFormat: extension,
      fileSize: req.file.size,
      uploader: req.user._id,
      university: req.user.university,
    });

    await awardPoints(req.user._id, "document_upload");

    return success(res, document, "Document uploaded", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
