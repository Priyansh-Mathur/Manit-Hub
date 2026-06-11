const DeviceToken = require("../models/DeviceToken");
const { success, error } = require("../utils/response");

/**
 * POST /api/push/register  { token, platform }
 */
exports.registerToken = async (req, res, next) => {
  try {
    const { token, platform = "web" } = req.body;

    if (!token || typeof token !== "string") {
      return error(res, "Device token required", 400);
    }

    // Re-registering moves the token to the current user (shared devices).
    await DeviceToken.findOneAndUpdate(
      { token },
      {
        token,
        platform,
        user: req.user._id,
        university: req.user.university,
      },
      { upsert: true, new: true }
    );

    return success(res, null, "Device registered for push");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/push/unregister  { token }
 */
exports.unregisterToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return error(res, "Device token required", 400);

    await DeviceToken.deleteOne({ token, user: req.user._id });

    return success(res, null, "Device unregistered");
  } catch (err) {
    next(err);
  }
};
