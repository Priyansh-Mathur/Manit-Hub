export const GRADES = [
  { grade: "A+", points: 10 },
  { grade: "A", points: 9 },
  { grade: "B+", points: 8 },
  { grade: "B", points: 7 },
  { grade: "C+", points: 6 },
  { grade: "C", points: 5 },
  { grade: "D", points: 4 },
  { grade: "F", points: 0 },
];

export const GRADE_POINTS = Object.fromEntries(
  GRADES.map(({ grade, points }) => [grade, points])
);

export const SEMESTER_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

/** SGPA for one subject list: Σ(credits × points) / Σcredits */
export const computeSgpa = (subjects) => {
  const valid = (subjects || []).filter(
    (s) => Number(s.credits) > 0 && s.grade in GRADE_POINTS
  );
  const credits = valid.reduce((sum, s) => sum + Number(s.credits), 0);
  if (!credits) return null;
  const points = valid.reduce(
    (sum, s) => sum + Number(s.credits) * GRADE_POINTS[s.grade],
    0
  );
  return points / credits;
};

/** CGPA across semesters (credit-weighted over every subject). */
export const computeCgpa = (records) => {
  const allSubjects = (records || []).flatMap((r) => r.subjects || []);
  return computeSgpa(allSubjects);
};

export const totalCredits = (records) =>
  (records || [])
    .flatMap((r) => r.subjects || [])
    .filter((s) => Number(s.credits) > 0 && s.grade in GRADE_POINTS)
    .reduce((sum, s) => sum + Number(s.credits), 0);

export const formatGpa = (value) =>
  value == null || Number.isNaN(value) ? "—" : value.toFixed(2);
