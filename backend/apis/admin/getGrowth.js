const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");

const User = require("../../models/User");
const Listing = require("../../models/Listing");
const Message = require("../../models/Message");
const Offer = require("../../models/Offer");

// Which metrics can be charted, and the model each counts by createdAt.
const METRICS = {
  users: User,
  listings: Listing,
  messages: Message,
  offers: Offer,
};

const TZ = "Asia/Kolkata";

/**
 * GET /api/admin/growth?metric=users&range=30  (admin)
 * Daily counts of new documents over the range, gaps filled with 0 so the
 * client can render a continuous line/bar chart.
 */
router.get("/growth", auth, isAdmin, async (req, res) => {
  try {
    const metric = String(req.query.metric || "users");
    const Model = METRICS[metric];
    if (!Model) {
      return error(res, `Unknown metric "${metric}"`, 400);
    }

    const range = Math.min(Math.max(Number(req.query.range) || 30, 1), 365);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (range - 1));

    const rows = await Model.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: TZ,
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = new Map(rows.map((r) => [r._id, r.count]));

    // Build a continuous day-by-day series.
    const series = [];
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const cursor = new Date(start);
    for (let i = 0; i < range; i++) {
      const key = fmt.format(cursor); // en-CA → YYYY-MM-DD
      series.push({ date: key, count: counts.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const total = series.reduce((sum, p) => sum + p.count, 0);

    return success(res, { metric, range, total, series });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
