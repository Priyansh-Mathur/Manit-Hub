export const DOC_TYPES = ["Notes", "PYQ", "Syllabus", "Sem Schedule", "Other"];

export const BRANCHES = [
  "CSE",
  "ECE",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Architecture & Planning",
  "MSME",
  "Mathematics",
  "Physics",
  "Chemistry",
  "MBA",
  "MCA",
];

export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export const formatFileSize = (bytes) => {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
