import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { fetchListings } from "../../api/listings";
import ListingCard from "./ListingCard";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function ListingsGrid({ filters }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      try {
        const response = await fetchListings({ ...filters, page, limit: 12 });
        if (Array.isArray(response.items)) {
          setListings(response.items);
          setMeta(response.meta);
        } else {
          setListings([]);
          setMeta(null);
        }
      } catch (err) {
        console.error("Failed to fetch listings", err);
        setListings([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, [filters, page]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No listings found"
        description="Try a different search or category — or be the first to list an item for sale."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted">
        Showing <span className="font-semibold text-fg">{listings.length}</span>{" "}
        {listings.length === 1 ? "result" : "results"}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item) => (
          <ListingCard key={item._id} item={item} />
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
            onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
