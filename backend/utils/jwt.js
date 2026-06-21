const jwt = require("jsonwebtoken");

const generateToken = (userId, universityId) => {
  return jwt.sign(
    {
      id: userId,
      university: universityId,
    },
    process.env.JWT_SECRET,
    // Long-lived session: users stay logged in until they explicitly log out.
    // Configurable via JWT_EXPIRE (e.g. "365d", "730d"); defaults to ~1 year.
    { expiresIn: process.env.JWT_EXPIRE || "365d" }
  );
};

module.exports = { generateToken };