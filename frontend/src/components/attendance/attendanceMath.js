/** Attendance helpers — pure math shared by the page and cards. */

export const percentage = (attended, held) =>
  held > 0 ? (attended / held) * 100 : null;

/**
 * How many upcoming classes can be skipped while staying >= target%.
 * Returns 0 when skipping even one class would drop below target.
 */
export const skippableClasses = (attended, held, target) => {
  if (held <= 0 || attended <= 0) return 0;
  const n = Math.floor((attended * 100) / target - held);
  return Math.max(0, n);
};

/**
 * How many classes in a row must be attended to climb back to target%.
 * Returns 0 when already at/above target.
 */
export const classesToRecover = (attended, held, target) => {
  if (held <= 0) return 0;
  if (percentage(attended, held) >= target) return 0;
  if (target >= 100) return Infinity;
  return Math.ceil((target * held - 100 * attended) / (100 - target));
};

export const formatPercent = (value) =>
  value == null || Number.isNaN(value) ? "—" : `${value.toFixed(1)}%`;
