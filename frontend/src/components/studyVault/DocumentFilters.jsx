import { useState } from "react";
import { Search } from "lucide-react";
import Segmented from "../ui/Segmented";
import { DOC_TYPES, BRANCHES, SEMESTERS } from "./constants";

const typeOptions = [
  { value: "All", label: "All" },
  ...DOC_TYPES.map((type) => ({ value: type, label: type })),
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "downloads", label: "Most downloaded" },
  { value: "title_asc", label: "Title: A to Z" },
];

export default function DocumentFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    branch: "All",
    subject: "",
    semester: "All",
    sort: "newest",
  });

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search notes, PYQs, subjects…"
            className="field pl-11"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <select
          className="field sm:w-52"
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Segmented
        options={typeOptions}
        value={filters.type}
        onChange={(type) => updateFilters({ type })}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          className="field"
          value={filters.branch}
          onChange={(e) => updateFilters({ branch: e.target.value })}
        >
          <option value="All">All branches</option>
          {BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        <input
          placeholder="Subject (e.g. Data Structures)"
          className="field"
          value={filters.subject}
          onChange={(e) => updateFilters({ subject: e.target.value })}
        />

        <select
          className="field"
          value={filters.semester}
          onChange={(e) => updateFilters({ semester: e.target.value })}
        >
          <option value="All">All semesters</option>
          {SEMESTERS.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
