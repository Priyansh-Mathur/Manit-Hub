import { useState } from "react";
import { MapPin, Clock, Trash2, Check, Plus, Users } from "lucide-react";
import { useAuthContext } from "../../context/useAuthContext";
import { useToast } from "../ui/useToast";
import { toggleRsvp, deleteEvent } from "../../api/events";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { AvatarStack } from "../ui/Avatar";
import ConfirmModal from "../ui/ConfirmModal";
import { CATEGORY_TONES } from "./constants";

const dateParts = (date) => {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric" }),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
  };
};

export default function EventCard({ event, onChanged, onDeleted }) {
  const { user } = useAuthContext();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isOrganizer = user && event.organizer?._id === user._id;
  const past = new Date(event.startAt) < new Date();
  const { day, month, time, weekday } = dateParts(event.startAt);

  const handleRsvp = async () => {
    setBusy(true);
    try {
      const updated = await toggleRsvp(event._id);
      onChanged?.(updated);
      show(updated.myRsvp ? "You're going 🎉" : "RSVP removed", "success");
    } catch (err) {
      console.error("RSVP failed", err);
      show(err?.response?.data?.message || "Could not update RSVP", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event._id);
      onDeleted?.(event._id);
      show("Event removed", "success");
    } catch (err) {
      console.error("Delete failed", err);
      show("Could not remove event", "error");
    }
  };

  return (
    <Card padded={false} className="flex gap-4 p-5">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
        <span className="font-display text-xl font-extrabold leading-none">
          {day}
        </span>
        <span className="text-[11px] font-semibold uppercase">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug text-fg">
            {event.title}
          </h3>
          {isOrganizer && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              aria-label="Delete event"
              className="ring-focus shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone={CATEGORY_TONES[event.category] || "neutral"}>
            {event.category}
          </Badge>
          {event.club && <Badge tone="neutral">{event.club}</Badge>}
          {past && <Badge tone="neutral">Past</Badge>}
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {weekday}, {time}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {event.venue}
            </span>
          )}
        </p>

        {event.description && (
          <p className="mt-2 text-sm text-muted line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {event.attendees?.length > 0 && (
              <AvatarStack people={event.attendees} max={4} size="xs" />
            )}
            <span className="flex items-center gap-1 text-xs text-muted">
              <Users size={12} /> {event.attendeeCount || 0} going
            </span>
          </div>

          {!past && !isOrganizer && (
            <Button
              size="sm"
              variant={event.myRsvp ? "secondary" : "primary"}
              leftIcon={event.myRsvp ? Check : Plus}
              loading={busy}
              onClick={handleRsvp}
            >
              {event.myRsvp ? "Going" : "RSVP"}
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete this event?"
        description="Everyone who RSVP'd will no longer see it."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          handleDelete();
        }}
      />
    </Card>
  );
}
