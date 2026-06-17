import { useEffect, useState } from "react";
import { CarFront, Plus, Search, CarTaxiFront } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import RideCard from "../components/rides/RideCard";
import PostRideModal from "../components/rides/PostRideModal";
import { fetchRides, createRide } from "../api/rides";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showPost, setShowPost] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchRides({
          filter,
          search: debouncedSearch || undefined,
        });
        setRides(response.items);
      } catch (err) {
        console.error("Failed to fetch rides", err);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, debouncedSearch]);

  const handlePost = async (payload) => {
    const created = await createRide(payload);
    setRides((prev) =>
      [...prev, created].sort(
        (a, b) => new Date(a.departureAt) - new Date(b.departureAt)
      )
    );
    show("Ride posted — happy pooling!", "success");
  };

  const handleChanged = (updated) => {
    setRides((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const handleDeleted = (id) => {
    setRides((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-6">
      <HubTabs hub="campus" />
      <PageHeader
        eyebrow="Community"
        title="Ride Share"
        subtitle="Split cabs to the station, airport or home — post a trip and fill the seats."
        icon={CarFront}
        actions={
          <Button leftIcon={Plus} onClick={() => setShowPost(true)}>
            Post a ride
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "mine", label: "My rides" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search from / to…"
            className="field pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <EmptyState
          icon={CarTaxiFront}
          title="No rides posted"
          description="Heading somewhere? Post your trip and split the fare."
          action={
            <Button leftIcon={Plus} onClick={() => setShowPost(true)}>
              Post a ride
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <RideCard
              key={ride._id}
              ride={ride}
              onChanged={handleChanged}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <PostRideModal
        open={showPost}
        onClose={() => setShowPost(false)}
        onSubmit={handlePost}
      />
    </div>
  );
}
