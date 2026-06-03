import { Search } from "lucide-react";
import { cn } from "../../lib/cn";

const subjects = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Other",
];

export default function StudyGroupFilters({ filters, onFiltersChange }) {
  return (
    <div className="mb-6 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search study groups…"
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="field pl-11"
          />
        </div>

        <select
          value={filters.subject}
          onChange={(e) =>
            onFiltersChange({ ...filters, subject: e.target.value })
          }
          className="field md:w-52"
        >
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            onFiltersChange({ ...filters, myGroups: !filters.myGroups })
          }
          className={cn(
            "ring-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
            filters.myGroups
              ? "border-primary-600 bg-primary-600 text-white shadow-sm"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              filters.myGroups ? "bg-white" : "bg-muted/40"
            )}
          />
          My groups
        </button>
      </div>
    </div>
  );
}
