const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const documentsController = require("../controllers/documents.controller");
const universityScope = require("../middleware/universityScope");
const uploadDocument = require("../middleware/uploadDocument");
const Document = require("../models/Document");

router.get("/", auth, documentsController.getDocuments);
router.get("/me", auth, documentsController.getMyDocuments);
router.post(
  "/",
  auth,
  uploadDocument.single("file"),
  documentsController.createDocument
);
router.post(
  "/:id/download",
  auth,
  universityScope(Document),
  documentsController.incrementDownload
);
router.delete(
  "/:id",
  auth,
  universityScope(Document),
  documentsController.deleteDocument
);

module.exports = router;
