const multer = require("multer");
const createDataUrlStorage = require("./dataUrlStorage");

// QR image stored inline as a data URL (no Cloudinary in prod). The client
// resizes before upload; this cap is just a safety net for the DB document.
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
    fileSize: 3 * 1024 * 1024, // 3MB (client resizes to ~300KB)
  },
});

module.exports = upload;
