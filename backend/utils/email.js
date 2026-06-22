// Single source of truth for the MANIT scholar-email rule.
// A valid login/signup email is a 10-digit scholar number @stu.manit.ac.in,
// e.g. 2311401212@stu.manit.ac.in.
const SCHOLAR_EMAIL_RE = /^\d{10}@stu\.manit\.ac\.in$/;

const SCHOLAR_EMAIL_MESSAGE =
  "Use your MANIT scholar email, e.g. 2311401212@stu.manit.ac.in";

// Normalize the same way the User schema does (trim + lowercase) before testing.
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidScholarEmail(email) {
  return SCHOLAR_EMAIL_RE.test(normalizeEmail(email));
}

module.exports = {
  SCHOLAR_EMAIL_RE,
  SCHOLAR_EMAIL_MESSAGE,
  normalizeEmail,
  isValidScholarEmail,
};
