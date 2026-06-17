// Shared by attendance/updateSubject.js and attendance/deleteSubject.js.
const ownedByUser = (subject, userId) =>
  subject.user.toString() === userId.toString();

module.exports = ownedByUser;
