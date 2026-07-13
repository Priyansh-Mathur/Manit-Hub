const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { success, error } = require("../../utils/response");
const { isValidHandle } = require("../../utils/handle");

/**
 * GET /api/users/handle-available?handle=
 */
router.get("/handle-available", auth, async (req, res) => {
  try {
    const handle = String(req.query.handle || "").toLowerCase().trim();
    if (!isValidHandle(handle)) {
      return success(res, {
        available: false,
        reason: "3–20 chars, letters/numbers/._ only",
      });
    }
    const taken = await User.exists({
      handle,
      _id: { $ne: req.user._id },
    });
    return success(res, { available: !taken });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
