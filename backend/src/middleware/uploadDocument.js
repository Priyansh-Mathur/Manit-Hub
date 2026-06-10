const multer = require("multer");
const createCloudinaryStorage = require("./cloudinaryStorage");

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
]);

const storage = createCloudinaryStorage(async (req, file) => ({
  folder: "manit-hub/documents",
  resource_type: "auto",
  public_id: `document_${req.user?._id}_${Date.now()}`,
}));

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
    return cb(
      new Error(
        "Unsupported file type. Allowed: pdf, doc(x), ppt(x), xls(x), txt, png, jpg, webp, zip"
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
