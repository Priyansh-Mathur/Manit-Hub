import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  MessageCircle,
  Trash2,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { messagesApi } from "../../api/messages";
import { joinRide, leaveRide, deleteRide } from "../../api/rides";
import { useAuthContext } from "../../context/useAuthContext";
import { useToast } from "../ui/useToast";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import ConfirmModal from "../ui/ConfirmModal";

const formatDeparture = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function RideCard({ ride, onChanged, onDeleted }) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isPoster = user && ride.poster?._id === user._id;
  const joined = ride.passengers?.some((p) => p._id === user?._id);
  const seatsLeft = ride.seatsTotal - (ride.passengers?.length || 0);
  const departed = new Date(ride.departureAt) < new Date();

  const handleJoinLeave = async () => {
    setBusy(true);
    try {
      const updated = joined
        ? await leaveRide(ride._id)
        : await joinRide(ride._id);
      onChanged?.(updated);
      show(joined ? "You left the ride" : "Seat booked 🎉", "success");
    } catch (err) {
      console.error("Join/leave failed", err);
      show(err?.response?.data?.message || "Could not update ride", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleMessage = async () => {
    try {
      await messagesApi.createConversation({
        listingId: ride._id,
        participantId: ride.poster._id,
        contextType: "ride",
      });
      navigate("/messages");
    } catch (err) {
      console.error("Error starting conversation:", err);
      show("Could not start conversation", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRide(ride._id);
      onDeleted?.(ride._id);
      show("Ride removed", "success");
    } catch (err) {
      console.error("Delete failed", err);
      show("Could not remove ride", "error");
    }
  };

  return (
    <Card padded={false} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 font-display text-base font-bold text-fg">
          <span className="truncate">{ride.from}</span>
          <ArrowRight size={16} className="shrink-0 text-primary-600" />
          <span className="truncate">{ride.to}</span>
        </div>
        {departed ? (
          <Badge tone="neutral">Departed</Badge>
        ) : seatsLeft > 0 ? (
          <Badge tone="success">
            {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
          </Badge>
        ) : (
          <Badge tone="danger">Full</Badge>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
        <CalendarClock size={14} />
        {formatDeparture(ride.departureAt)}
      </p>

      {ride.note && (
        <p className="mt-2 text-sm text-muted line-clamp-2">{ride.note}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            src={ride.poster?.avatarUrl}
            name={ride.poster?.displayName || "Student"}
            size="xs"
          />
          <span className="truncate text-sm font-medium text-fg">
            {ride.poster?.displayName}
          </span>
        </div>

        {(ride.passengers?.length || 0) > 0 && (
          <span
            className="flex shrink-0 items-center gap-1 text-xs text-muted"
            title={ride.passengers.map((p) => p.displayName).join(", ")}
          >
            <Users size={13} /> {ride.passengers.length} joined
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!isPoster && !departed && (
          <>
            <Button
              size="sm"
              fullWidth
              variant={joined ? "secondary" : "primary"}
              leftIcon={joined ? UserMinus : UserPlus}
              loading={busy}
              disabled={!joined && seatsLeft <= 0}
              onClick={handleJoinLeave}
            >
              {joined ? "Leave ride" : seatsLeft > 0 ? "Join ride" : "Full"}
            </Button>
            <button
              type="button"
              onClick={handleMessage}
              aria-label="Message poster"
              className="ring-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-surface text-muted transition hover:border-primary-500/40 hover:text-primary-600"
            >
              <MessageCircle size={16} />
            </button>
          </>
        )}
        {isPoster && (
          <Button
            size="sm"
            fullWidth
            variant="danger"
            leftIcon={Trash2}
            onClick={() => setShowDelete(true)}
          >
            Cancel ride
          </Button>
        )}
      </div>

      <ConfirmModal
        open={showDelete}
        title="Cancel this ride?"
        description="Everyone who joined will be notified."
        confirmText="Cancel ride"
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
