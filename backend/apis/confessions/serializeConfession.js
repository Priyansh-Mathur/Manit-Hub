// Shared by the confessions endpoint files (getConfessions, createConfession,
// react, addComment). Maps a confession doc to its public (anonymized) shape;
// the author and per-user identities never leave the server.
const crypto = require("crypto");
const { REACTION_TYPES } = require("../../models/Confession");

// Deterministic anonymous handle per (confession, user) — stable inside a
// thread, different across confessions, and never reversible to the user.
const anonHandle = (confessionId, userId) =>
  "Anon-" +
  crypto
    .createHash("sha1")
    .update(`${confessionId}:${userId}:manit-hub-anon`)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

const serializeConfession = (confession, viewerId) => {
  const viewer = viewerId.toString();
  const authorId = confession.author.toString();

  const reactionCounts = Object.fromEntries(
    REACTION_TYPES.map((type) => [type, 0])
  );
  let myReaction = null;
  for (const reaction of confession.reactions) {
    reactionCounts[reaction.type] += 1;
    if (reaction.user.toString() === viewer) myReaction = reaction.type;
  }

  return {
    _id: confession._id,
    content: confession.content,
    createdAt: confession.createdAt,
    isMine: authorId === viewer,
    reactionCounts,
    totalReactions: confession.reactionsCount,
    myReaction,
    commentCount: confession.comments.length,
    comments: confession.comments.map((comment) => ({
      _id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      handle:
        comment.author.toString() === authorId
          ? "OP"
          : anonHandle(confession._id, comment.author),
      isMine: comment.author.toString() === viewer,
    })),
    reportedByMe: confession.reports.some(
      (report) => report.user.toString() === viewer
    ),
  };
};

module.exports = serializeConfession;
