import { useMemo, useRef, useState } from "react";
import {
  GraduationCap,
  Home,
  Landmark,
  MapPinned,
  ParkingSquare,
  Search,
  Shirt,
  UtensilsCrossed,
} from "lucide-react";

const MAP_SRC =
  "https://www.google.com/maps/d/embed?mid=1D1OCIlq49qF4mNJKGKJ5YeAk_Deulpw";

const locations = [
  { name: "MANIT Library", category: "Academic" },
  { name: "NEW TEACHING BLOCK (N.T.B)", category: "Academic" },
  { name: "Mechanical Engineering Department", category: "Academic" },
  { name: "Electrical Engineering Department", category: "Academic" },
  { name: "Electronics and Communication Engineering Department", category: "Academic" },
  { name: "Hostel no. 2", category: "Hostel" },
  { name: "Hostel 11 MANIT", category: "Hostel" },
  { name: "Hostel 8", category: "Hostel" },
  { name: "Nescafe Canteen", category: "Food" },
  { name: "Susangat- The taste of MANIT", category: "Food" },
  { name: "Neelam food Centre", category: "Food" },
  { name: "Sports Complex, NIT Bhopal", category: "Sports" },
  { name: "MANIT Basketball Court", category: "Sports" },
  { name: "Tennis Court, MANIT", category: "Sports" },
  { name: "Faculty Guest House", category: "Landmark" },
  { name: "VIP Guest House MANIT", category: "Landmark" },
  { name: "Manit Shiva Temple", category: "Landmark" },
  { name: "PMC Chauraha", category: "Transport" },
  { name: "Parking lot", category: "Transport" },
];

const categoryMeta = {
  Academic: {
    icon: GraduationCap,
    pill: "border-sky-200 bg-sky-50 text-sky-700",
    accent: "from-sky-500/15 to-cyan-500/15",
  },
  Hostel: {
    icon: Home,
    pill: "border-violet-200 bg-violet-50 text-violet-700",
    accent: "from-violet-500/15 to-fuchsia-500/15",
  },
  Food: {
    icon: UtensilsCrossed,
    pill: "border-orange-200 bg-orange-50 text-orange-700",
    accent: "from-orange-500/15 to-amber-500/15",
  },
  Sports: {
    icon: Shirt,
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent: "from-emerald-500/15 to-lime-500/15",
  },
  Landmark: {
    icon: Landmark,
    pill: "border-rose-200 bg-rose-50 text-rose-700",
    accent: "from-rose-500/15 to-red-500/15",
  },
  Transport: {
    icon: ParkingSquare,
    pill: "border-zinc-200 bg-zinc-50 text-zinc-700",
    accent: "from-zinc-500/15 to-neutral-500/15",
  },
};

const categories = ["All", "Academic", "Hostel", "Food", "Sports", "Landmark", "Transport"];

export default function CampusMaps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const mapRef = useRef(null);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !term ||
        location.name.toLowerCase().includes(term) ||
        location.category.toLowerCase().includes(term);
      const matchesCategory = activeCategory === "All" || location.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const iframeSrc = selectedLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${selectedLocation.name}, MANIT Bhopal`)}&output=embed`
    : MAP_SRC;

  const handleSelect = (location) => {
    setSelectedLocation(location);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-gray-50 to-white p-6 shadow-[8px_8px_0_0_#00000012] dark:border-white/10 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              MANIT Smart Campus
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Interactive campus map and location finder
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Search real MANIT locations, filter by category, and open the selected place directly in the embedded campus map.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-neutral-900">
            <MapPinned className="h-5 w-5 text-black dark:text-white" />
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                Active location
              </div>
              <div className="text-sm font-semibold">{selectedLocation?.name}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-[8px_8px_0_0_#00000012] backdrop-blur dark:border-white/10 dark:bg-neutral-950/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search MANIT locations..."
              className="w-full rounded-2xl border border-black/10 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white dark:border-white/10 dark:bg-neutral-900 dark:focus:border-white"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("All");
              setSelectedLocation(locations[0]);
            }}
            className="rounded-2xl border border-black px-4 py-3 text-sm font-medium text-black transition hover:-translate-y-0.5 hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Reset map
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const meta = category === "All" ? null : categoryMeta[category];
            const Icon = meta?.icon;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-black bg-black text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-200 dark:hover:bg-neutral-800"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div
          ref={mapRef}
          className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[8px_8px_0_0_#00000012] dark:border-white/10 dark:bg-neutral-950"
        >
          <div className="border-b border-black/5 px-5 py-4 dark:border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">MANIT Campus Map</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Embedded Google map for the selected location.
                </p>
              </div>
              <div className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:text-gray-300">
                {filteredLocations.length} results
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-neutral-900">
              <iframe
                key={iframeSrc}
                title="MANIT Campus Map"
                src={iframeSrc}
                width="100%"
                height="700"
                style={{ border: 0, borderRadius: "16px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-[8px_8px_0_0_#00000012] dark:border-white/10 dark:bg-neutral-950/90">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Locations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click a location to focus the map.
              </p>
            </div>
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-neutral-900 dark:text-gray-300">
              {filteredLocations.length} shown
            </div>
          </div>

          <div className="grid gap-3 max-h-[760px] overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
            {filteredLocations.length ? (
              filteredLocations.map((location) => {
                const meta = categoryMeta[location.category];
                const Icon = meta.icon;
                const isSelected = selectedLocation?.name === location.name;

                return (
                  <button
                    key={location.name}
                    type="button"
                    onClick={() => handleSelect(location)}
                    className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-black bg-black text-white shadow-lg dark:border-white dark:bg-white dark:text-black"
                        : "border-black/10 bg-gray-50 hover:border-black/20 dark:border-white/10 dark:bg-neutral-900 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border bg-gradient-to-br ${meta.accent} ${
                          isSelected ? "border-white/20" : "border-black/10 dark:border-white/10"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? "text-black" : "text-inherit"}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold leading-6">{location.name}</h3>
                          {isSelected ? (
                            <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                              Selected
                            </span>
                          ) : null}
                        </div>
                        <p className={`mt-1 text-sm ${isSelected ? "text-white/80 dark:text-black/70" : "text-gray-500 dark:text-gray-400"}`}>
                          {location.category}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-black/15 bg-gray-50 p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-400">
                No locations match your current search and filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
