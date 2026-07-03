const multer = require("multer");
const { imageFileFilter } = require("./imageFileFilter");

// Keep the upload in memory; the route turns it into a base64 data URL stored
// on the user document. This deliberately avoids Cloudinary (prod creds are not
// configured) and local disk (ephemeral on the host), so a freshly uploaded
// avatar persists via the database and survives redeploys. The client resizes
// the image before sending, so the stored data URL stays small.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (pre-resize safety cap)
  },
});

module.exports = upload;
