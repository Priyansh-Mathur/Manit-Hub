// Shared by the forum endpoint files (questions + answers).
const AUTHOR_FIELDS = "displayName avatarUrl";

const withMyUpvote = (doc, viewerId) => {
  const data = doc.toObject();
  data.myUpvote = doc.upvotes.some(
    (u) => u.toString() === viewerId.toString()
  );
  delete data.upvotes;
  return data;
};

module.exports = { AUTHOR_FIELDS, withMyUpvote };
