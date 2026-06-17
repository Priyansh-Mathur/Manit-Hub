// Shared by the events endpoint files (getEvents, createEvent, toggleRsvp).
const serializeEvent = (event, viewerId) => {
  const data = event.toObject();
  data.attendeeCount = event.attendees.length;
  data.myRsvp = event.attendees.some(
    (a) => (a._id || a).toString() === viewerId.toString()
  );
  // keep a small avatar strip, not the whole list
  data.attendees = data.attendees.slice(0, 5);
  return data;
};

module.exports = serializeEvent;
