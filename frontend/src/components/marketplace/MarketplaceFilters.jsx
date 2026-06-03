import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/cn";

const categories = [
  "All",
  "Textbooks",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Other",
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "title_asc", label: "Title: A to Z" },
  { value: "title_desc", label: "Title: Z to A" },
];

export default function MarketplaceFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

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
            placeholder="Search for items…"
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

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={cn(
            "ring-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
            showAdvanced
              ? "border-primary-500/40 bg-primary-600/10 text-primary-700 dark:text-primary-200"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Price
        </button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-bg p-4">
          <span className="text-sm font-medium text-muted">Price range (₹)</span>
          <input
            type="number"
            placeholder="Min"
            className="field w-28"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            className="field w-28"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => updateFilters({ category: cat })}
              className={cn(
                "ring-focus rounded-full border px-4 py-1.5 text-sm font-medium transition",
                active
                  ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                  : "bg-surface text-muted hover:border-primary-500/40 hover:text-fg"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
