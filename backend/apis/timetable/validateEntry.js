// Shared by timetable/createEntry.js and timetable/updateEntry.js.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateEntry = ({ subject, dayOfWeek, startTime, endTime }) => {
  if (!subject || !subject.trim()) return "Subject is required";
  const day = Number(dayOfWeek);
  if (Number.isNaN(day) || day < 0 || day > 6) return "Invalid day";
  if (!TIME_PATTERN.test(startTime)) return "Invalid start time";
  if (!TIME_PATTERN.test(endTime)) return "Invalid end time";
  if (endTime <= startTime) return "Class must end after it starts";
  return null;
};

module.exports = validateEntry;
