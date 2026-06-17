const User = require("../models/User");
const { success } = require("../utils/response");

/**
 * GET /api/leaderboard
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const [topUsers, betterCount, me] = await Promise.all([
      User.find({ university: req.user.university })
        .select("displayName avatarUrl points badges")
        .sort({ points: -1, createdAt: 1 })
        .limit(20),
      User.countDocuments({
        university: req.user.university,
        points: { $gt: req.user.points || 0 },
      }),
      User.findById(req.user._id).select("displayName avatarUrl points badges"),
    ]);

    return success(res, {
      leaderboard: topUsers,
      me: {
        ...me.toObject(),
        rank: betterCount + 1,
      },
    });
  } catch (err) {
    next(err);
  }
};
