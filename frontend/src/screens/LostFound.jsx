import { useEffect, useState } from "react";
import { SearchCheck, Plus, Search, PackageSearch } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import LostFoundCard from "../components/lostFound/LostFoundCard";
import PostItemModal from "../components/lostFound/PostItemModal";
import { KIND_OPTIONS, LF_CATEGORIES } from "../components/lostFound/constants";
import { fetchLostFoundItems, createLostFoundItem } from "../api/lostFound";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("all");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [kind, category, debouncedSearch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchLostFoundItems({
          kind,
          category,
          search: debouncedSearch || undefined,
          page,
          limit: 12,
        });
        setItems(response.items);
        setMeta(response.meta);
      } catch (err) {
        console.error("Failed to fetch lost & found items", err);
        setItems([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [kind, category, debouncedSearch, page]);

  const handlePost = async (formData) => {
    const created = await createLostFoundItem(formData);
    setItems((prev) => [created, ...prev]);
    show("Posted to Lost & Found", "success");
  };

  const handleChanged = (updated) => {
    setItems((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
  };

  const handleDeleted = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="space-y-6">
      <HubTabs hub="campus" />
      <PageHeader
        eyebrow="Community"
        title="Lost & Found"
        subtitle="Reunite lost items with their owners — post what you've lost or found on campus."
        icon={SearchCheck}
        actions={
          <Button leftIcon={Plus} onClick={() => setShowPost(true)}>
            Post item
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented options={KIND_OPTIONS} value={kind} onChange={setKind} />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="field pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="field w-40"
          >
            <option value="All">All categories</option>
            {LF_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing here yet"
          description="No items match your filters — or campus karma is at an all-time high."
          action={
            <Button leftIcon={Plus} onClick={() => setShowPost(true)}>
              Post an item
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LostFoundCard
                key={item._id}
                item={item}
                onChanged={handleChanged}
                onDeleted={handleDeleted}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <PostItemModal
        isOpen={showPost}
        onClose={() => setShowPost(false)}
        onSubmit={handlePost}
      />
    </div>
  );
}
