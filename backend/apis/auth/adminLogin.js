const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../../models/User");
const University = require("../../models/University");
const { generateToken } = require("../../utils/jwt");
const { success, error } = require("../../utils/response");

// Reserved, regex-valid placeholder identity for the backing admin user. It
// satisfies the MANIT scholar-email pattern so mongoose validation passes, but
// nobody logs in with it — the CEO authenticates with ADMIN_ID / ADMIN_PASSWORD
// and this record only exists so middleware/auth.js can load req.user.
const ADMIN_EMAIL = "0000000000@stu.manit.ac.in";

// Constant-time compare that also tolerates differing lengths (timingSafeEqual
// throws on length mismatch) by hashing both sides to a fixed width first.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * POST /api/auth/admin-login  — secret CEO/owner login.
 * Body: { adminId, password }. Credentials come from backend env
 * (ADMIN_ID / ADMIN_PASSWORD), never from the student-email system.
 */
router.post("/admin-login", async (req, res, next) => {
  try {
    const { adminId, password } = req.body;

    const envId = process.env.ADMIN_ID;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envId || !envPassword) {
      return error(res, "Admin login is not configured", 503);
    }

    if (!adminId || !password) {
      return error(res, "Admin ID and password required", 400);
    }

    // Compute both comparisons before AND-ing so a wrong id and a wrong
    // password take the same path (don't reveal which half failed).
    const idOk = safeEqual(adminId, envId);
    const passOk = safeEqual(password, envPassword);
    if (!(idOk && passOk)) {
      return error(res, "Invalid credentials", 401);
    }

    // Find-or-create the backing admin user so req.user resolves normally.
    let user = await User.findOne({ email: ADMIN_EMAIL })
      .select("+tokenVersion")
      .populate("university", "name logoUrl");

    if (!user) {
      const university = await University.findOne().sort({ createdAt: 1 });
      if (!university) {
        return error(
          res,
          "No university configured — seed a University before admin login",
          503
        );
      }

      user = await User.create({
        email: ADMIN_EMAIL,
        // Random password — this login path never checks it, but the schema
        // requires one (and it's hashed by the pre-save hook).
        password: crypto.randomBytes(24).toString("hex"),
        displayName: process.env.ADMIN_DISPLAY_NAME || "Manit Hub CEO",
        university: university._id,
        isAdmin: true,
        emailVerified: true,
      });
      user = await User.findById(user._id)
        .select("+tokenVersion")
        .populate("university", "name logoUrl");
    } else if (!user.isAdmin) {
      // Self-heal in case the flag was ever cleared.
      user.isAdmin = true;
      await user.save();
    }

    const token = generateToken(
      user._id,
      user.university._id,
      user.tokenVersion || 0
    );

    return success(res, {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        handle: user.handle,
        avatarUrl: user.avatarUrl,
        university: user.university,
        isAdmin: true,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
