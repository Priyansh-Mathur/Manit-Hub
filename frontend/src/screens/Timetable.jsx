import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Clock, MapPin, User } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ClassModal from "../components/timetable/ClassModal";
import {
  DAY_NAMES,
  WEEK_ORDER,
  subjectColor,
  formatTimeRange,
} from "../components/timetable/constants";
import { cn } from "../lib/cn";
import {
  fetchTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from "../api/timetable";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, entry: null });
  const { show } = useToast();
  const today = new Date().getDay();

  useEffect(() => {
    const load = async () => {
      try {
        setEntries(await fetchTimetable());
      } catch (err) {
        console.error("Failed to load timetable", err);
        show("Could not load your timetable", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const byDay = useMemo(() => {
    const grouped = Object.fromEntries(WEEK_ORDER.map((d) => [d, []]));
    for (const entry of entries) grouped[entry.dayOfWeek]?.push(entry);
    for (const day of WEEK_ORDER) {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  }, [entries]);

  const handleAdd = async (payload) => {
    const created = await createTimetableEntry(payload);
    setEntries((prev) => [...prev, created]);
    show("Class added", "success");
  };

  const handleEdit = async (payload) => {
    const updated = await updateTimetableEntry(modal.entry._id, payload);
    setEntries((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e))
    );
    show("Class updated", "success");
  };

  const handleDelete = async (entry) => {
    try {
      await deleteTimetableEntry(entry._id);
      setEntries((prev) => prev.filter((e) => e._id !== entry._id));
      show("Class removed", "success");
    } catch (err) {
      console.error("Failed to delete class", err);
      show("Could not remove class", "error");
    }
  };

  return (
    <div className="space-y-6">
      <HubTabs hub="academics" />
      <PageHeader
        eyebrow="Academics"
        title="Timetable"
        subtitle="Your weekly class schedule — reminders land ~30 minutes before each class."
        icon={CalendarDays}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => setModal({ open: true, entry: null })}
          >
            Add class
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No classes yet"
          description="Add your weekly classes to see your schedule and get reminders."
          action={
            <Button
              leftIcon={Plus}
              onClick={() => setModal({ open: true, entry: null })}
            >
              Add class
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-7">
          {WEEK_ORDER.map((day) => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className={cn(
                  "rounded-2xl border bg-card p-3 shadow-card",
                  isToday && "ring-2 ring-primary-500/40"
                )}
              >
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-fg">
                    {DAY_NAMES[day].slice(0, 3)}
                  </h3>
                  {isToday && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Today
                    </span>
                  )}
                </div>

                {byDay[day].length === 0 ? (
                  <p className="px-1 pb-2 text-xs text-muted">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {byDay[day].map((entry) => (
                      <button
                        key={entry._id}
                        type="button"
                        onClick={() => setModal({ open: true, entry })}
                        className={cn(
                          "ring-focus w-full rounded-xl border p-2.5 text-left transition hover:-translate-y-0.5",
                          subjectColor(entry.subject)
                        )}
                      >
                        <p className="text-sm font-semibold leading-tight">
                          {entry.subject}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
                          <Clock size={11} />
                          {formatTimeRange(entry.startTime, entry.endTime)}
                        </p>
                        {entry.room && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-80">
                            <MapPin size={11} /> {entry.room}
                          </p>
                        )}
                        {entry.professor && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-80">
                            <User size={11} /> {entry.professor}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ClassModal
        open={modal.open}
        entry={modal.entry}
        onClose={() => setModal({ open: false, entry: null })}
        onSubmit={modal.entry ? handleEdit : handleAdd}
        onDelete={handleDelete}
      />
    </div>
  );
}
