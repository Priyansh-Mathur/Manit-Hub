const multer = require("multer");

// Keep the upload in memory; the route turns it into a base64 data URL stored
// on the user document. This deliberately avoids Cloudinary (prod creds are not
// configured) and local disk (ephemeral on the host), so a freshly uploaded
// avatar persists via the database and survives redeploys. The client resizes
// the image before sending, so the stored data URL stays small.
const storage = multer.memoryStorage();

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
    fileSize: 5 * 1024 * 1024, // 5MB (pre-resize safety cap)
  },
});

module.exports = upload;
