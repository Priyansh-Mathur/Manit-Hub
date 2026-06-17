// Shared by the offers endpoint files (getOffers, createOffer, updateOffer).
const POPULATE = [
  { path: "listing", select: "title price images status isActive" },
  { path: "buyer", select: "displayName avatarUrl" },
  { path: "seller", select: "displayName avatarUrl" },
];

module.exports = POPULATE;
