const multer = require("multer");
const createDataUrlStorage = require("./dataUrlStorage");

// Images are stored inline as data URLs (no Cloudinary in prod). The client
// resizes before upload; this size cap is just a safety net so the item
// document (up to 4 images) stays well under MongoDB's 16MB limit.
const storage = createDataUrlStorage();

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
    fileSize: 2 * 1024 * 1024, // 2MB per image (client resizes to ~200KB)
  },
});

module.exports = upload;
