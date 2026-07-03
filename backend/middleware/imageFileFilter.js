// Shared multer fileFilter for image uploads (avatars, listing/lost-found
// images, QR codes, study-group covers).
//
// Why not just `mimetype.startsWith("image/")`: that also accepts
// `image/svg+xml`, and an SVG can carry <script>/onload markup. If such a file
// is ever rendered inline (not inside an <img>) it becomes stored XSS. We only
// allow raster formats the app actually uses.
const ALLOWED_IMAGE_MIMETYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_MIMETYPES.has(file.mimetype)) {
    return cb(
      new Error("Only JPEG, PNG, WebP, or GIF images are allowed"),
      false
    );
  }
  cb(null, true);
};

module.exports = { imageFileFilter, ALLOWED_IMAGE_MIMETYPES };
