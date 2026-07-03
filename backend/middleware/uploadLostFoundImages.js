const multer = require("multer");
const createDataUrlStorage = require("./dataUrlStorage");
const { imageFileFilter } = require("./imageFileFilter");

// Images are stored inline as data URLs (no Cloudinary in prod). The client
// resizes before upload; this size cap is just a safety net so the item
// document (up to 4 images) stays well under MongoDB's 16MB limit.
const storage = createDataUrlStorage();

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB per image (client resizes to ~200KB)
  },
});

module.exports = upload;
