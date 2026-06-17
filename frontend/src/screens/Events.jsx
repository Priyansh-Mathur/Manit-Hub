import { useEffect, useState } from "react";
import { PartyPopper, Plus, Search, CalendarX } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import EventCard from "../components/events/EventCard";
import CreateEventModal from "../components/events/CreateEventModal";
import { EVENT_CATEGORIES } from "../components/events/constants";
import { fetchEvents, createEvent } from "../api/events";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filter, category, debouncedSearch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchEvents({
          filter,
          category,
          search: debouncedSearch || undefined,
          page,
          limit: 12,
        });
        setEvents(response.items);
        setMeta(response.meta);
      } catch (err) {
        console.error("Failed to fetch events", err);
        setEvents([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, category, debouncedSearch, page]);

  const handleCreate = async (payload) => {
    const created = await createEvent(payload);
    setEvents((prev) =>
      [...prev, created].sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    );
    show("Event published 🎉", "success");
  };

  const handleChanged = (updated) => {
    setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
  };

  const handleDeleted = (id) => {
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="space-y-6">
      <HubTabs hub="campus" />
      <PageHeader
        eyebrow="Community"
        title="Events & Clubs"
        subtitle="Everything happening on campus — RSVP and get a reminder before it starts."
        icon={PartyPopper}
        actions={
          <Button leftIcon={Plus} onClick={() => setShowCreate(true)}>
            Create event
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "mine", label: "Mine" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="field pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="field w-36"
          >
            <option value="All">All types</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No events found"
          description="Nothing on the calendar for this filter — host something!"
          action={
            <Button leftIcon={Plus} onClick={() => setShowCreate(true)}>
              Create event
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
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

      <CreateEventModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
