// Mirror of backend/utils/email.js so users get instant feedback before submit.
// The backend remains the authoritative gate.
export const SCHOLAR_EMAIL_RE = /^\d{10}@stu\.manit\.ac\.in$/;

export const SCHOLAR_EMAIL_MESSAGE =
  "Use your MANIT scholar email, e.g. 2311401212@stu.manit.ac.in";

export function isValidScholarEmail(email) {
  return SCHOLAR_EMAIL_RE.test(String(email || "").trim().toLowerCase());
}
