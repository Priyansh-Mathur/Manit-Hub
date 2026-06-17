import { useMemo, useRef, useState } from "react";
import {
  GraduationCap,
  Home,
  Landmark,
  MapPinned,
  ParkingSquare,
  Search,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "../lib/cn";

const MAP_SRC =
  "https://www.google.com/maps/d/embed?mid=1D1OCIlq49qF4mNJKGKJ5YeAk_Deulpw";

const locations = [
  // Academic
  { name: "MANIT Central Library", category: "Academic", query: "MANIT Central Library, Bhopal" },
  { name: "New Teaching Block (NTB)", category: "Academic", query: "New Teaching Block, MANIT Bhopal" },
  { name: "Computer Science & Engg Dept", category: "Academic", query: "23.216924,77.409330" },
  { name: "Electronics & Communication Dept", category: "Academic", query: "Electronics and Communication Engineering Department, Maulana Azad National Institute of Technology, 6C84+HW3, Energy Center Rd, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Electrical Engineering Dept", category: "Academic", query: "Electrical Engineering Department, MANIT Bhopal" },
  { name: "Mechanical Engineering Dept", category: "Academic", query: "Mechanical Engineering Department, Maulana Azad National Institute Of Technology (MANIT), 6C75+M9F, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Civil Engineering Dept", category: "Academic", query: "Civil Engineering Department (New Block), Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Architecture & Planning Dept", category: "Academic", query: "Department of Architecture and Planning, MANIT Bhopal" },

  // Hostels — all 12 (official Bhawan names)
  { name: "Hostel 1 · Homi Bhabha Bhawan", category: "Hostel", query: "Brothers Cafe, No.3, Hostel Rd, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Hostel 2 · Vikram Sarabhai Bhawan", category: "Hostel", query: "Hostel no. 2, 3, Hostel Rd, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Hostel 3", category: "Hostel", query: "Hostel No 3, MANIT Bhopal" },
  { name: "Hostel 4", category: "Hostel", query: "Hostel No 4, MANIT Bhopal" },
  { name: "Hostel 5 · Visvesvaraya Bhawan", category: "Hostel", query: "Hostel No 5, MANIT Bhopal" },
  { name: "Hostel 6 · J. C. Bose Bhawan", category: "Hostel", query: "Manit Hostel NO.6, 6C78+HGC, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Hostel 7 · Kalpana Chawla Bhawan (Girls)", category: "Hostel", query: "23.215045,77.401546" },
  { name: "Hostel 8 · Ramanujan Bhawan", category: "Hostel", query: "Hostel No 8, MANIT Bhopal" },
  { name: "Hostel 9 · Raja Ramanna Bhawan", category: "Hostel", query: "Hostel No 9, MANIT Bhopal" },
  { name: "HOSTEL 10 A AND B", category: "Hostel", query: "Hostel No 10, MANIT Bhopal" },
  { name: "Hostel 11", category: "Hostel", query: "Hostel 11 MANIT, 11, Hostel Rd, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Hostel 12 · Bhagini Nivedita Bhawan (Girls)", category: "Hostel", query: "H-12 Nivedita Bhawan, 698X+HQQ, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },

  // Cafés & canteens
  { name: "Susangat Food Court", category: "Food", query: "Susangat, MANIT Bhopal" },
  { name: "Nescafe Canteen", category: "Food", query: "Canteen, 6C84+4GG, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },
  { name: "Neelam Food Centre", category: "Food", query: "Neelam Food Centre, MANIT Bhopal" },
  { name: "Top N Town", category: "Food", query: "23.217234,77.404014" },

  // Sports grounds & playgrounds
  { name: "Sports Complex (Gymkhana)", category: "Sports", query: "Sports Complex, NIT Bhopal" },
  { name: "Cricket Ground", category: "Sports", query: "MANIT Cricket Ground, Bhopal" },
  { name: "Football Ground", category: "Sports", query: "MANIT Football Ground, Bhopal" },
  { name: "Athletics Track & Field", category: "Sports", query: "MANIT Athletics Ground, Bhopal" },
  { name: "Basketball Court", category: "Sports", query: "MANIT Basketball Court, Bhopal" },
  { name: "Volleyball Court", category: "Sports", query: "23.212323,77.406469" },
  { name: "Lawn Tennis Court", category: "Sports", query: "Tennis Court, MANIT Bhopal" },

  // Landmarks
  { name: "Manit Gate", category: "Landmark", query: "Manit square, 6CC4+P62, Harshavardhan Nagar, Panchsheel Nagar, Bhopal, Madhya Pradesh 462003, India" },
  { name: "MANIT Shiva Temple", category: "Landmark", query: "Shiv Mandir, MANIT Bhopal" },
  { name: "Faculty Guest House", category: "Landmark", query: "Faculty Guest House, MANIT Bhopal" },
  { name: "VIP Guest House", category: "Landmark", query: "VIP Guest House, MANIT Bhopal" },

  // Transport
  { name: "Main Parking Lot", category: "Transport", query: "BIKE PARKING STAND, 6C95+32R Computer science division, Maulana Azad National Institute of Technology, Bhopal, Madhya Pradesh 462003, India" },

  // Secret spots
  { name: "PMC Chauraha", category: "Secret Spots", query: "23.214623,77.402078" },
];

const categoryMeta = {
  Academic: { icon: GraduationCap, accent: "from-sky-500/15 to-cyan-500/15 text-sky-600" },
  Hostel: { icon: Home, accent: "from-violet-500/15 to-fuchsia-500/15 text-violet-600" },
  Food: { icon: UtensilsCrossed, accent: "from-orange-500/15 to-amber-500/15 text-orange-600" },
  Sports: { icon: Dumbbell, accent: "from-emerald-500/15 to-lime-500/15 text-emerald-600" },
  Landmark: { icon: Landmark, accent: "from-rose-500/15 to-red-500/15 text-rose-600" },
  Transport: { icon: ParkingSquare, accent: "from-zinc-500/15 to-neutral-500/15 text-zinc-500" },
  "Secret Spots": { icon: MapPinned, accent: "from-indigo-500/15 to-blue-500/15 text-indigo-600" },
};

const categories = ["All", "Academic", "Hostel", "Food", "Sports", "Landmark", "Transport", "Secret Spots"];

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
      const matchesCategory =
        activeCategory === "All" || location.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const iframeSrc = selectedLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        selectedLocation.query || `${selectedLocation.name}, MANIT Bhopal`
      )}&output=embed`
    : MAP_SRC;

  const handleSelect = (location) => {
    setSelectedLocation(location);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-800/40 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 p-6 text-white shadow-card sm:p-8">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-200">
              MANIT Smart Campus
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find your way around campus
            </h1>
            <p className="mt-3 text-sm leading-6 text-primary-100/90">
              Every hostel, canteen, department and sports ground across MANIT —
              search, filter by category, and open it in the live campus map.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <MapPinned className="h-5 w-5 text-gold-200" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary-100">
                Active location
              </div>
              <div className="text-sm font-semibold">{selectedLocation?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search MANIT locations…"
              className="field pl-11"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("All");
              setSelectedLocation(locations[0]);
            }}
            className="ring-focus inline-flex h-11 items-center justify-center rounded-xl border bg-surface px-4 text-sm font-medium text-muted transition hover:text-fg"
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
                className={cn(
                  "ring-focus inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                    : "bg-surface text-muted hover:text-fg"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + list */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div
          ref={mapRef}
          className="overflow-hidden rounded-2xl border bg-card shadow-card"
        >
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-fg">
                MANIT Campus Map
              </h2>
              <p className="text-sm text-muted">
                Embedded map for the selected location.
              </p>
            </div>
            <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted">
              {filteredLocations.length} results
            </span>
          </div>
          <div className="p-4">
            <div className="overflow-hidden rounded-xl border bg-muted/10">
              <iframe
                key={iframeSrc}
                title="MANIT Campus Map"
                src={iframeSrc}
                width="100%"
                height="640"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-fg">Locations</h2>
              <p className="text-sm text-muted">Tap a place to focus the map.</p>
            </div>
            <span className="rounded-full bg-muted/15 px-3 py-1 text-xs font-medium text-muted">
              {filteredLocations.length}
            </span>
          </div>

          <div className="grid max-h-[680px] gap-3 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
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
                    className={cn(
                      "ring-focus group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                      isSelected
                        ? "border-primary-600 bg-primary-600 text-white shadow-lift"
                        : "bg-surface hover:border-primary-500/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br",
                          isSelected
                            ? "border-white/20 from-white/15 to-white/5 text-white"
                            : `border-border ${meta.accent}`
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold leading-5">{location.name}</h3>
                        <p
                          className={cn(
                            "mt-1 text-sm",
                            isSelected ? "text-white/80" : "text-muted"
                          )}
                        >
                          {location.category}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted">
                No locations match your search and filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
