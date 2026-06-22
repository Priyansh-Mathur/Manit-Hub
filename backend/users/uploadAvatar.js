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

    // cloudinaryStorage sets req.file.path to the Cloudinary secure URL.
    req.user.avatarUrl = req.file.path;
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
