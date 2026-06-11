export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Mon → Sat first (campus week), Sunday last.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Deterministic accent per subject so a course keeps its colour everywhere.
const SUBJECT_PALETTE = [
  "border-primary-500/40 bg-primary-600/10 text-primary-700 dark:text-primary-200",
  "border-accent-500/40 bg-accent-600/10 text-accent-700 dark:text-accent-200",
  "border-success-500/40 bg-success-500/10 text-success-700 dark:text-success-100",
  "border-gold-500/40 bg-gold-500/10 text-gold-700 dark:text-gold-300",
  "border-danger-500/40 bg-danger-500/10 text-danger-700 dark:text-danger-100",
];

export const subjectColor = (subject) => {
  let hash = 0;
  for (const ch of subject || "") hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length];
};

export const formatTimeRange = (start, end) => {
  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
};
