const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");
const User = require("../../models/User");
const Report = require("../../models/Report");
const TARGETS = require("../reports/targets");
const { AUTHOR_FIELD } = require("../../utils/moderation");

/**
 * GET /api/admin/users/:id  (admin)
 * Full profile + every piece of content the user owns ("their files") across
 * all reportable models, plus the reports filed against that content and the
 * ban reason / strikes — everything needed to judge a (possibly fake) report.
 */
router.get("/users/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return error(res, "Invalid user id", 400);
    }

    const user = await User.findById(id)
      .select(
        "displayName handle email avatarUrl bio phone points badges strikes isBanned banReason bannedAt isAdmin emailVerified createdAt university"
      )
      .populate("university", "name");

    if (!user) {
      return error(res, "User not found", 404);
    }

    // Gather this user's content in every reportable type.
    const types = Object.keys(AUTHOR_FIELD);
    const perType = await Promise.all(
      types.map(async (type) => {
        const Model = TARGETS[type].model();
        const field = AUTHOR_FIELD[type];
        const [count, recentDocs, ids] = await Promise.all([
          Model.countDocuments({ [field]: id }),
          Model.find({ [field]: id }).sort({ createdAt: -1 }).limit(5),
          Model.distinct("_id", { [field]: id }),
        ]);
        const recent = recentDocs.map((doc) => {
          const snap = TARGETS[type].snapshot(doc);
          return {
            id: doc._id,
            title: snap.title,
            content: snap.content,
            createdAt: doc.createdAt,
            hidden: doc.isActive === false || doc.isHidden === true,
          };
        });
        return { type, count, recent, ids };
      })
    );

    const content = {};
    let totalContent = 0;
    for (const t of perType) {
      content[t.type] = { count: t.count, recent: t.recent };
      totalContent += t.count;
    }

    // Reports filed against any of that content.
    const orClauses = perType
      .filter((t) => t.ids.length)
      .map((t) => ({ targetType: t.type, targetId: { $in: t.ids } }));

    const reports = orClauses.length
      ? await Report.find({ $or: orClauses })
          .populate("reporter", "displayName handle avatarUrl")
          .populate("handledBy", "displayName")
          .sort({ createdAt: -1 })
          .limit(50)
      : [];

    return success(res, {
      user,
      content,
      totalContent,
      reports,
      reportsCount: reports.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
