import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Tag,
  Link2,
  MapPin,
  Video,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import Badge from "../ui/Badge";

export default function StudyGroupCard({
  group,
  onJoin,
  onLeave,
  currentUser,
  isJoined,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/study-groups/${group._id}`);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const normalizeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const linkItems = [
    group.links?.whatsapp && { label: "WhatsApp", url: group.links.whatsapp },
    group.links?.telegram && { label: "Telegram", url: group.links.telegram },
    group.links?.discord && { label: "Discord", url: group.links.discord },
    group.links?.googleMeet && { label: "Google Meet", url: group.links.googleMeet },
    ...(group.customLinks || []).map((link) => ({
      label: link.label || "Link",
      url: link.url,
    })),
  ].filter((item) => item && item.url);

  const nextSession = group.nextSession;
  const isCreator = currentUser && group.creator?._id === currentUser._id;
  const canViewConnections = isCreator || isJoined;
  const full = group.members.length >= group.maxMembers;

  return (
    <div
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-32 overflow-hidden">
        {group.image ? (
          <img
            src={group.image}
            alt={group.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
            <span className="font-display text-4xl font-extrabold text-white/80">
              {group.subject?.[0]}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone="solid">{group.subject}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold leading-snug text-fg line-clamp-1">
              {group.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted line-clamp-2">
              {group.description}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted">
            <Users size={12} />
            {group.members.length}/{group.maxMembers}
          </span>
        </div>

        {group.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {group.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} tone="neutral" icon={Tag}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {nextSession?.at && canViewConnections && (
          <div className="mt-3 rounded-xl border bg-bg p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium text-fg">
                <Calendar size={14} className="text-primary-600" />
                {formatDate(nextSession.at)}
              </span>
              {nextSession.mode && (
                <Badge tone="primary">{nextSession.mode}</Badge>
              )}
            </div>
            {nextSession.location && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <MapPin size={12} />
                {nextSession.location}
              </div>
            )}
            {nextSession.meetingLink && (
              <a
                href={normalizeUrl(nextSession.meetingLink)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
              >
                <Video size={12} />
                Join link
              </a>
            )}
          </div>
        )}

        {canViewConnections && linkItems.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
              Connections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {linkItems.slice(0, 4).map((link, index) => (
                <a
                  key={`${link.label}-${index}`}
                  href={normalizeUrl(link.url)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-primary-500/40 hover:text-primary-600"
                >
                  <Link2 size={12} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {!canViewConnections && (
          <div className="mt-3 rounded-xl border border-dashed p-3 text-xs text-muted">
            Join the group to see connection links and meetup details.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <span className="truncate text-sm text-muted">
            by{" "}
            <span className="font-medium text-fg">
              {group.creator?.displayName || "Unknown"}
            </span>
          </span>

          <div className="flex items-center gap-2">
            {isCreator ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="ring-focus inline-flex items-center gap-1 rounded-lg border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="ring-focus inline-flex items-center gap-1 rounded-lg border border-danger-500/30 px-2.5 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-500/10"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </>
            ) : (
              currentUser && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isJoined) onLeave(group._id);
                    else onJoin(group._id);
                  }}
                  disabled={!isJoined && full}
                  className={
                    isJoined
                      ? "ring-focus rounded-lg bg-muted/15 px-4 py-1.5 text-sm font-semibold text-fg transition hover:bg-muted/25"
                      : "ring-focus rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                  }
                >
                  {isJoined ? "Leave" : full ? "Full" : "Join"}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
