const { error } = require("../utils/response");

// Must run after auth — gates admin-only moderation routes.
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return error(res, "Admin access required", 403);
  }
  next();
};

module.exports = isAdmin;
