// Shared by the friends endpoint files (PUBLIC_FIELDS is also re-declared in
// users/getFriendsOf.js, which is mounted under /api/users).
const PUBLIC_FIELDS = "displayName handle avatarUrl";

const sortedPair = (a, b) => [a.toString(), b.toString()].sort();

module.exports = { PUBLIC_FIELDS, sortedPair };
