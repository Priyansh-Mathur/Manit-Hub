const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const uploadAvatar = require("../middleware/uploadAvatar");
const { success, error } = require("../utils/response");

router.put("/avatar", auth, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image uploaded", 400);
    }

    // Defensive cap: the client resizes to ~20KB, so anything large here means
    // an un-resized upload. Reject to keep user docs (and API responses) small.
    if (req.file.size > 2 * 1024 * 1024) {
      return error(res, "Image too large. Please choose a smaller photo.", 400);
    }

    // Store the image inline as a base64 data URL (works without Cloudinary or
    // disk; persists in the DB across redeploys).
    req.user.avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    await req.user.save();

    return success(
      res,
      { avatarUrl: req.user.avatarUrl },
      "Avatar updated successfully"
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
