// Shared by the events endpoint files (getEvents, createEvent, toggleRsvp).
const POPULATE = [
  { path: "organizer", select: "displayName avatarUrl" },
  { path: "attendees", select: "displayName avatarUrl" },
];

module.exports = POPULATE;
