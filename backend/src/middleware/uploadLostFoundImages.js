const multer = require("multer");
const createCloudinaryStorage = require("./cloudinaryStorage");

const storage = createCloudinaryStorage(async (req, file) => ({
  folder: "manit-hub/lost-found",
  resource_type: "image",
  public_id: `lostfound_${req.user?._id}_${Date.now()}`,
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [
    {
      width: 1200,
      height: 1200,
      crop: "limit",
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
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
