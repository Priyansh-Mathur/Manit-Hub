const User = require("../models/User");

// Karma awarded per contribution type.
const POINTS = {
  document_upload: 15,
  question_posted: 5,
  answer_posted: 10,
  answer_accepted: 25,
  listing_created: 5,
  confession_posted: 2,
  ride_posted: 5,
  event_created: 10,
  lostfound_posted: 5,
  comment_posted: 2,
};

// One-off badges granted the first time an action happens,
// plus milestone badges when point thresholds are crossed.
const ACTION_BADGES = {
  document_upload: "Note Sharer",
  answer_accepted: "Problem Solver",
  event_created: "Event Host",
  ride_posted: "Road Tripper",
};

const MILESTONES = [
  { points: 100, badge: "Rising Star" },
  { points: 500, badge: "Campus Hero" },
  { points: 1000, badge: "MANIT Legend" },
];

/**
 * Fire-and-forget points/badges award. Never throws — gamification must
 * not break the action that triggered it.
 */
const awardPoints = async (userId, action) => {
  try {
    const points = POINTS[action];
    if (!points || !userId) return;

    const newBadges = [];
    if (ACTION_BADGES[action]) newBadges.push(ACTION_BADGES[action]);

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true, select: "points badges" }
    );
    if (!user) return;

    for (const milestone of MILESTONES) {
      if (user.points >= milestone.points) newBadges.push(milestone.badge);
    }

    const missing = newBadges.filter((b) => !user.badges.includes(b));
    if (missing.length) {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { badges: { $each: missing } } }
      );
    }
  } catch (err) {
    console.error("awardPoints failed:", err.message);
  }
};

module.exports = { awardPoints, POINTS, MILESTONES };
