const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const uploadLostFoundImages = require("../../middleware/uploadLostFoundImages");
const LostFoundItem = require("../../models/LostFoundItem");
const { success, error } = require("../../utils/response");
const { awardPoints } = require("../../utils/gamification");

/**
 * POST /api/lost-found
 */
router.post("/", auth, uploadLostFoundImages.array("images", 4), async (req, res, next) => {
  try {
    const { title, description, kind, category, location } = req.body;

    if (!title || !kind || !category) {
      return error(res, "Missing required fields", 400);
    }

    if (!["lost", "found"].includes(kind)) {
      return error(res, "Kind must be lost or found", 400);
    }

    const images = (req.files || []).map((file) => file.path);

    const item = await LostFoundItem.create({
      title,
      description,
      kind,
      category,
      location,
      images,
      reporter: req.user._id,
      university: req.user.university,
    });

    await item.populate("reporter", "displayName avatarUrl");

    await awardPoints(req.user._id, "lostfound_posted");

    return success(res, item, "Item posted", 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
