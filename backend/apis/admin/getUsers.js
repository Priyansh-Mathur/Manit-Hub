const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const User = require("../../models/User");

/**
 * GET /api/admin/users?status=all|suspended|active&search=&page=1  (admin)
 * Paginated, searchable directory of all accounts.
 */
router.get("/users", auth, isAdmin, async (req, res, next) => {
  try {
    const { status = "all", search = "", page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit) || 20, 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

    const query = {};
    if (status === "suspended") query.isBanned = true;
    else if (status === "active") query.isBanned = { $ne: true };

    const term = String(search).trim();
    if (term) {
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ displayName: rx }, { handle: rx }, { email: rx }];
    }

    const [users, total, suspendedCount] = await Promise.all([
      User.find(query)
        .select(
          "displayName handle email avatarUrl points strikes isBanned isAdmin emailVerified bannedAt createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      User.countDocuments(query),
      User.countDocuments({ isBanned: true }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        suspendedCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
