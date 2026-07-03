const multer = require("multer");
const createDataUrlStorage = require("./dataUrlStorage");
const { imageFileFilter } = require("./imageFileFilter");

// QR image stored inline as a data URL (no Cloudinary in prod). The client
// resizes before upload; this cap is just a safety net for the DB document.
const storage = createDataUrlStorage();

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB (client resizes to ~300KB)
  },
});

module.exports = upload;
