import { useState } from "react";
import {
  Coffee,
  Landmark,
  MapPinned,
  ParkingSquare,
  School,
  Trophy,
  BedDouble,
} from "lucide-react";
import ManitMap from "../components/ManitMap";
import Card from "../components/ui/Card";

export default function CampusMaps() {
  const [activeTab, setActiveTab] = useState("map");

  const campusPlaces = {
    transport: [
      {
        title: "PMC Chauraha",
        description: "Main junction connecting academic and hostel areas",
      },
      {
        title: "Parking lot",
        description: "Student and faculty vehicle parking area",
      },
      {
        title: "Energy Centre Parking Lot",
        description: "Parking area near Energy Centre",
      },
    ],

    sports: [
      {
        title: "Tennis Court, MANIT",
        description: "Outdoor tennis facility for students and tournaments",
      },
      {
        title: "Sports Complex, NIT Bhopal",
        description: "Indoor and outdoor sports activities center",
      },
      {
        title: "Basketball Court",
        description: "Open basketball practice and match court",
      },
      {
        title: "MANIT Basketball Court",
        description: "Dedicated basketball arena for students",
      },
    ],

    academics: [
      {
        title: "MANIT Library",
        description: "Central library with study and digital resources",
      },
      {
        title: "NEW TEACHING BLOCK (N.T.B)",
        description: "Central classroom and lecture complex",
      },
      {
        title: "Dean Academic Office",
        description: "Administrative office for academic affairs",
      },
      {
        title: "Mechanical Engineering Department",
        description: "Mechanical Engineering classrooms and labs",
      },
      {
        title: "Electrical Engineering Department",
        description: "Electrical Engineering academic building",
      },
    ],

    hostels: [
      {
        title: "Hostel no. 2",
        description: "Student residential hostel",
      },
      {
        title: "Hostel 11 MANIT",
        description: "Modern student hostel facility",
      },
      {
        title: "Hostel 8",
        description: "Residential hostel area",
      },
    ],

    food: [
      {
        title: "Neelam food Centre",
        description: "Popular campus food and snacks spot",
      },
      {
        title: "Nescafe Canteen",
        description: "Coffee, snacks, and beverages for students",
      },
      {
        title: "Susangat- The taste of MANIT",
        description: "Student favorite dining and fast-food outlet",
      },
    ],

    landmarks: [
      {
        title: "Faculty Guest House",
        description: "Accommodation facility for visiting faculty",
      },
      {
        title: "VIP Guest House MANIT",
        description: "Guest accommodation for dignitaries and visitors",
      },
      {
        title: "Manit Shiva Temple",
        description: "Temple located inside the campus",
      },
    ],
  };

  const campusSections = [
    {
      key: "sports",
      label: "Sports Facilities",
      icon: Trophy,
      accent: "from-emerald-500/15 to-lime-500/15 text-emerald-700",
      items: campusPlaces.sports,
    },
    {
      key: "academics",
      label: "Academic Buildings",
      icon: School,
      accent: "from-sky-500/15 to-cyan-500/15 text-sky-700",
      items: campusPlaces.academics,
    },
    {
      key: "hostels",
      label: "Hostels",
      icon: BedDouble,
      accent: "from-violet-500/15 to-fuchsia-500/15 text-violet-700",
      items: campusPlaces.hostels,
    },
    {
      key: "food",
      label: "Food & Cafeteria",
      icon: Coffee,
      accent: "from-orange-500/15 to-amber-500/15 text-orange-700",
      items: campusPlaces.food,
    },
    {
      key: "landmarks",
      label: "Campus Landmarks",
      icon: Landmark,
      accent: "from-rose-500/15 to-red-500/15 text-rose-700",
      items: campusPlaces.landmarks,
    },
    {
      key: "transport",
      label: "Transport & Parking",
      icon: MapPinned,
      accent: "from-zinc-500/15 to-neutral-500/15 text-zinc-700",
      items: campusPlaces.transport,
    },
  ];

  

  const tabs = [
    { id: "map", label: "Interactive Map" },
    { id: "info", label: "Campus Info" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Campus Maps & Info</h1>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Tab */}
      {activeTab === "map" && (
        <div className="space-y-6">
          <ManitMap />
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">
                    MANIT Campus Dashboard
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Real campus locations and facilities
                  </h2>
                </div>
                <div className="rounded-2xl border bg-black px-3 py-2 text-white shadow-[4px_4px_0_0_#a3a3a3]">
                  <MapPinned className="h-5 w-5" />
                </div>
              </div>

              <p className="text-sm leading-6 text-gray-600">
                Browse key MANIT locations across sports, academics, hostels,
                food, landmarks, and transport. The cards below replace the
                placeholder campus content with real campus points of interest.
              </p>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">
                    Navigation Overview
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Organized by campus use
                  </h2>
                </div>
                <div className="rounded-2xl border bg-black px-3 py-2 text-white shadow-[4px_4px_0_0_#a3a3a3]">
                  <School className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 sm:grid-cols-3">
                {campusSections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-xl border bg-gray-50 px-3 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </div>
                    <p>{section.items.length} locations</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {campusSections.map((section) => (
              <Card key={section.key}>
                <div className="mb-6 flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${section.accent}`}
                  >
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {section.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Key MANIT locations in this category
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
