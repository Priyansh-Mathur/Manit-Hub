const cloudinary = require("../config/cloudinary");

const createCloudinaryStorage = (paramsFactory) => ({
  _handleFile: async (req, file, cb) => {
    try {
      const params = await paramsFactory(req, file);
      const upload = cloudinary.uploader.upload_stream(params, (err, result) => {
        if (err) {
          return cb(err);
        }

        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      });

      file.stream.pipe(upload);
    } catch (err) {
      cb(err);
    }
  },
  _removeFile: (req, file, cb) => {
    if (!file.filename) {
      return cb(null);
    }

    cloudinary.uploader.destroy(file.filename, cb);
  },
});

module.exports = createCloudinaryStorage;
