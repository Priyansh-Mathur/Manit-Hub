const multer = require("multer");
const createCloudinaryStorage = require("./cloudinaryStorage");

// Avatars go to Cloudinary (like every other upload in the app) so they
// persist on the serverless deploy and are served from a stable CDN URL.
const storage = createCloudinaryStorage(async (req, file) => ({
  folder: "manit-hub/avatars",
  resource_type: "image",
  public_id: `avatar_${req.user?._id}_${Date.now()}`,
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [
    {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
      quality: "auto",
    },
  ],
}));

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
