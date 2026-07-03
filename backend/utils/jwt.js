const jwt = require("jsonwebtoken");

const generateToken = (userId, universityId, tokenVersion = 0) => {
  return jwt.sign(
    {
      id: userId,
      university: universityId,
      // Token version — bumped on password reset so stolen/old tokens die
      // even though sessions are long-lived. Checked in middleware/auth.js.
      tv: tokenVersion,
    },
    process.env.JWT_SECRET,
    // Long-lived session: users stay logged in until they explicitly log out.
    // Configurable via JWT_EXPIRE (e.g. "365d", "730d"); defaults to ~1 year.
    { expiresIn: process.env.JWT_EXPIRE || "365d" }
  );
};

module.exports = { generateToken };