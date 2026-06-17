// Shared by the rides endpoint files (getRides, createRide, joinRide, leaveRide).
const POPULATE = [
  { path: "poster", select: "displayName avatarUrl" },
  { path: "passengers", select: "displayName avatarUrl" },
];

module.exports = POPULATE;
