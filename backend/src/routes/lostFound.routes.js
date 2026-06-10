const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const lostFoundController = require("../controllers/lostFound.controller");
const universityScope = require("../middleware/universityScope");
const uploadLostFoundImages = require("../middleware/uploadLostFoundImages");
const LostFoundItem = require("../models/LostFoundItem");

router.get("/", auth, lostFoundController.getItems);
router.post(
  "/",
  auth,
  uploadLostFoundImages.array("images", 4),
  lostFoundController.createItem
);
router.patch(
  "/:id/status",
  auth,
  universityScope(LostFoundItem),
  lostFoundController.updateStatus
);
router.delete(
  "/:id",
  auth,
  universityScope(LostFoundItem),
  lostFoundController.deleteItem
);

module.exports = router;
