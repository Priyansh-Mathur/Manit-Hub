const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { success, error } = require("../../utils/response");

const User = require("../../models/User");
const Listing = require("../../models/Listing");
const Offer = require("../../models/Offer");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const Report = require("../../models/Report");
const Document = require("../../models/Document");
const StudyGroup = require("../../models/StudyGroup");
const Confession = require("../../models/Confession");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const Ride = require("../../models/Ride");
const Event = require("../../models/Event");
const LostFoundItem = require("../../models/LostFoundItem");
const Friendship = require("../../models/Friendship");

const since = (ms) => new Date(Date.now() - ms);
const DAY = 24 * 60 * 60 * 1000;

/**
 * GET /api/admin/overview  (admin) — platform-wide KPI snapshot.
 * Global (no university filter) so the CEO sees everything.
 */
router.get("/overview", auth, isAdmin, async (req, res) => {
  try {
    const d1 = since(DAY);
    const d7 = since(7 * DAY);
    const d30 = since(30 * DAY);

    const [
      totalUsers,
      newUsers24h,
      newUsers7d,
      newUsers30d,
      verifiedUsers,
      suspendedUsers,
      activeSenderIds,

      totalListings,
      activeListings,
      soldListings,

      totalConversations,
      totalMessages,
      messages7d,

      totalOffers,
      acceptedOffers,

      totalDocuments,
      totalStudyGroups,
      totalConfessions,
      totalQuestions,
      totalAnswers,
      totalRides,
      totalEvents,
      totalLostFound,
      totalFriendships,

      openReports,
      resolvedReports,
      dismissedReports,
      downloadAgg,
      handleTimeAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: d1 } }),
      User.countDocuments({ createdAt: { $gte: d7 } }),
      User.countDocuments({ createdAt: { $gte: d30 } }),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ isBanned: true }),
      Message.distinct("sender", { createdAt: { $gte: d7 } }),

      Listing.countDocuments({}),
      Listing.countDocuments({ isActive: true, status: "available" }),
      Listing.countDocuments({ status: "sold" }),

      Conversation.countDocuments({}),
      Message.countDocuments({}),
      Message.countDocuments({ createdAt: { $gte: d7 } }),

      Offer.countDocuments({}),
      Offer.countDocuments({ status: "accepted" }),

      Document.countDocuments({}),
      StudyGroup.countDocuments({}),
      Confession.countDocuments({}),
      Question.countDocuments({}),
      Answer.countDocuments({}),
      Ride.countDocuments({}),
      Event.countDocuments({}),
      LostFoundItem.countDocuments({}),
      Friendship.countDocuments({ status: "accepted" }),

      Report.countDocuments({ status: "open" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "dismissed" }),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: "$downloadCount" } } },
      ]),
      // Average moderation handling time (hours) for handled reports.
      Report.aggregate([
        { $match: { handledAt: { $ne: null } } },
        {
          $group: {
            _id: null,
            avgMs: { $avg: { $subtract: ["$handledAt", "$createdAt"] } },
          },
        },
      ]),
    ]);

    const totalDownloads = downloadAgg[0]?.total || 0;
    const avgHandleHours = handleTimeAgg[0]?.avgMs
      ? +(handleTimeAgg[0].avgMs / (60 * 60 * 1000)).toFixed(1)
      : null;

    return success(res, {
      users: {
        total: totalUsers,
        new24h: newUsers24h,
        new7d: newUsers7d,
        new30d: newUsers30d,
        verified: verifiedUsers,
        suspended: suspendedUsers,
        active7d: activeSenderIds.length,
      },
      marketplace: {
        totalListings,
        activeListings,
        soldListings,
        totalOffers,
        acceptedOffers,
        offerAcceptanceRate: totalOffers
          ? +((acceptedOffers / totalOffers) * 100).toFixed(1)
          : 0,
      },
      engagement: {
        conversations: totalConversations,
        messages: totalMessages,
        messages7d,
        friendships: totalFriendships,
      },
      content: {
        documents: totalDocuments,
        downloads: totalDownloads,
        studyGroups: totalStudyGroups,
        confessions: totalConfessions,
        questions: totalQuestions,
        answers: totalAnswers,
        rides: totalRides,
        events: totalEvents,
        lostFound: totalLostFound,
      },
      moderation: {
        openReports,
        resolvedReports,
        dismissedReports,
        avgHandleHours,
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
