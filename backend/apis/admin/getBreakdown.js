const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");

const Listing = require("../../models/Listing");
const Report = require("../../models/Report");
const Document = require("../../models/Document");

const toMap = (rows) =>
  rows.reduce((acc, r) => {
    acc[r._id ?? "unknown"] = r.count;
    return acc;
  }, {});

/**
 * GET /api/admin/breakdown  (admin) — distributions + top content for the
 * dashboard's secondary charts and leaderboards.
 */
router.get("/breakdown", auth, isAdmin, async (req, res) => {
  try {
    const [
      listingsByCategory,
      listingsByStatus,
      reportsByType,
      reportsByStatus,
      topDocuments,
      topSellers,
    ] = await Promise.all([
      Listing.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Listing.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Report.aggregate([
        { $group: { _id: "$targetType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Report.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Document.find({ isActive: true })
        .sort({ upvoteCount: -1, downloadCount: -1 })
        .limit(5)
        .select("title upvoteCount downloadCount type")
        .populate("uploader", "displayName handle avatarUrl"),
      Listing.aggregate([
        { $group: { _id: "$seller", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: "$seller" },
        {
          $project: {
            _id: 0,
            listings: "$count",
            "seller._id": 1,
            "seller.displayName": 1,
            "seller.handle": 1,
            "seller.avatarUrl": 1,
          },
        },
      ]),
    ]);

    return success(res, {
      listingsByCategory: toMap(listingsByCategory),
      listingsByStatus: toMap(listingsByStatus),
      reportsByType: toMap(reportsByType),
      reportsByStatus: toMap(reportsByStatus),
      topDocuments,
      topSellers,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
