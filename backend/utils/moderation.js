const User = require("../models/User");
const Report = require("../models/Report");
const TARGETS = require("../apis/reports/targets");

// Auto-hide a piece of content once this many distinct users have reported it,
// so egregious content disappears before a moderator gets to it. Configurable.
const AUTO_HIDE_REPORTS = Number(process.env.AUTO_HIDE_REPORTS || 3);

// Suspend a user automatically after this many strikes (content removed by a
// moderator, or auto-hidden by reports). Configurable.
const AUTO_BAN_STRIKES = Number(process.env.AUTO_BAN_STRIKES || 3);

// Which report target types map to an author, so a strike can be attributed.
const AUTHOR_FIELD = {
  listing: "seller",
  document: "uploader",
  confession: "author",
  question: "author",
  answer: "author",
  lostfound: "reporter", // lost & found item's poster field
  ride: "poster",
  event: "organizer",
};

/**
 * Add strikes to a user and auto-suspend them once they cross the threshold.
 * Safe to call with a missing/updated user — no-ops if not found.
 */
async function addStrike(userId, reason = "content removed") {
  if (!userId) return;
  const user = await User.findById(userId).select("strikes isBanned");
  if (!user || user.isBanned) return;

  user.strikes = (user.strikes || 0) + 1;
  if (user.strikes >= AUTO_BAN_STRIKES) {
    user.isBanned = true;
    user.banReason = `Automatic suspension after ${user.strikes} strikes (${reason})`;
    user.bannedAt = new Date();
  }
  await user.save();
}

/**
 * Called after a new report is filed. If the content now has enough distinct
 * reports, auto-hide it and strike its author. Never throws into the request.
 */
async function maybeAutoHide(targetType, targetId) {
  try {
    const target = TARGETS[targetType];
    if (!target) return;

    const openCount = await Report.countDocuments({
      targetType,
      targetId,
      status: "open",
    });
    if (openCount < AUTO_HIDE_REPORTS) return;

    const doc = await target.model().findById(targetId);
    if (!doc) return;

    // Already hidden? Nothing to do (and don't double-strike).
    if (doc.isActive === false || doc.isHidden === true) return;

    target.remove(doc); // sets isActive=false / isHidden=true
    await doc.save();

    const authorId = doc[AUTHOR_FIELD[targetType]];
    if (authorId) await addStrike(authorId, `${targetType} auto-hidden by reports`);
  } catch (e) {
    console.error("auto-hide failed:", e.message);
  }
}

module.exports = {
  addStrike,
  maybeAutoHide,
  AUTHOR_FIELD,
  AUTO_HIDE_REPORTS,
  AUTO_BAN_STRIKES,
};
