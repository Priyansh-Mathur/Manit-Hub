// Custom multer storage engine: buffers the upload in memory and exposes it as
// a base64 data URL on `file.path`. This is a drop-in replacement for
// cloudinaryStorage — route handlers read `file.path` either way — used because
// production has no Cloudinary credentials, so images are stored inline in
// MongoDB instead. Keep images small (tight multer fileSize limits + the
// client-side resize before upload) so documents stay well under MongoDB's
// 16MB per-document cap.
const createDataUrlStorage = () => ({
  _handleFile(req, file, cb) {
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", cb);
    file.stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      cb(null, {
        path: `data:${file.mimetype};base64,${buffer.toString("base64")}`,
        size: buffer.length,
      });
    });
  },
  _removeFile(req, file, cb) {
    cb(null);
  },
});

module.exports = createDataUrlStorage;
