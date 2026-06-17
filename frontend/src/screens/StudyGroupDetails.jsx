import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Tag,
  Link2,
  MapPin,
  Video,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { studyGroupsApi } from "../api/studyGroups";
import { useAuthContext } from "../context/useAuthContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function StudyGroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const loadGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studyGroupsApi.getStudyGroup(id);
      const groupData = response.data?.data;
      setGroup(groupData);
      setIsJoined(
        Boolean(user?._id && groupData?.members?.some((m) => m._id === user._id))
      );
    } catch (err) {
      console.error("Error loading group:", err);
      setError(err.response?.data?.message || "Failed to load group details");
    } finally {
      setLoading(false);
    }
  }, [id, user?._id]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  const handleJoinGroup = async () => {
    try {
      setActionLoading(true);
      await studyGroupsApi.joinStudyGroup(id);
      setIsJoined(true);
      loadGroupDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setShowLeave(false);
    try {
      setActionLoading(true);
      await studyGroupsApi.leaveStudyGroup(id);
      setIsJoined(false);
      loadGroupDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setShowDelete(false);
    try {
      setActionLoading(true);
      await studyGroupsApi.deleteStudyGroup(id);
      navigate("/study-groups");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete group");
      setActionLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
      weekday: "long",
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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner size={28} />
        <p className="text-sm text-muted">Loading group details…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted">Group not found.</p>
        <Button leftIcon={ArrowLeft} onClick={() => navigate("/study-groups")}>
          Back to groups
        </Button>
      </div>
    );
  }

  const isCreator = user && group.creator?._id === user._id;
  const nextSession = group.nextSession;
  const full = group.members.length >= group.maxMembers;

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={() => navigate("/study-groups")}
        >
          Back
        </Button>
        {isCreator && (
          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            loading={actionLoading}
            onClick={() => setShowDelete(true)}
          >
            Delete group
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        {group.image ? (
          <img
            src={group.image}
            alt={group.name}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
            <span className="font-display text-6xl font-extrabold text-white/80">
              {group.subject?.[0]}
            </span>
          </div>
        )}
        <div className="p-6 sm:p-8">
          <Badge tone="solid">{group.subject}</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg">
            {group.name}
          </h1>
          <p className="mt-2 text-muted">{group.description}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-bg p-4">
              <div className="flex items-center gap-2 text-muted">
                <Users size={16} />
                <span className="text-sm">Members</span>
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-fg">
                {group.members.length}/{group.maxMembers}
              </p>
            </div>
            {nextSession?.at && (
              <div className="rounded-2xl border bg-bg p-4">
                <div className="flex items-center gap-2 text-muted">
                  <Calendar size={16} />
                  <span className="text-sm">Next session</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-fg">
                  {formatDate(nextSession.at)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {group.tags.length > 0 && (
        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-fg">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag, index) => (
              <Badge key={index} tone="neutral" icon={Tag}>
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {nextSession?.at && (
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-fg">
            <Calendar size={18} className="text-primary-600" />
            Next meetup
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted">Date &amp; time</p>
              <p className="font-semibold text-fg">{formatDate(nextSession.at)}</p>
            </div>
            {nextSession.mode && (
              <div>
                <p className="mb-1 text-muted">Mode</p>
                <Badge tone="primary" className="capitalize">
                  {nextSession.mode}
                </Badge>
              </div>
            )}
            {nextSession.location && (
              <div>
                <p className="mb-1 flex items-center gap-1 text-muted">
                  <MapPin size={14} /> Location
                </p>
                <p className="font-semibold text-fg">{nextSession.location}</p>
              </div>
            )}
            {nextSession.meetingLink && (
              <a
                href={normalizeUrl(nextSession.meetingLink)}
                target="_blank"
                rel="noreferrer"
                className="ring-focus inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <Video size={16} />
                Join meeting
              </a>
            )}
          </div>
        </Card>
      )}

      {isJoined && linkItems.length > 0 && (
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-fg">
            <Link2 size={18} className="text-primary-600" />
            Connections
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {linkItems.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                href={normalizeUrl(link.url)}
                target="_blank"
                rel="noreferrer"
                className="ring-focus inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-primary-500/40 hover:text-primary-600"
              >
                <Link2 size={15} />
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      )}

      {!isJoined && linkItems.length > 0 && (
        <div className="rounded-2xl border border-dashed bg-surface/60 p-4 text-sm text-muted">
          Join the group to see connection links and contact details.
        </div>
      )}

      <Card>
        <h3 className="mb-4 font-display text-lg font-bold text-fg">Created by</h3>
        <div className="flex items-center gap-3">
          <Avatar
            src={group.creator?.avatar || group.creator?.avatarUrl}
            name={group.creator?.displayName || group.creator?.name || "?"}
            size="md"
          />
          <div>
            <p className="font-semibold text-fg">
              {group.creator?.displayName || group.creator?.name}
            </p>
            <p className="text-sm text-muted">{group.creator?.email}</p>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border bg-surface/95 p-3 shadow-lift backdrop-blur">
          {isJoined ? (
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              loading={actionLoading}
              onClick={() => setShowLeave(true)}
            >
              Leave group
            </Button>
          ) : (
            <Button
              fullWidth
              size="lg"
              loading={actionLoading}
              disabled={full}
              onClick={handleJoinGroup}
            >
              {full ? "Group full" : "Join group"}
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLeave}
        title="Leave this group?"
        description="You can re-join later if there's space."
        confirmText="Leave"
        tone="danger"
        onCancel={() => setShowLeave(false)}
        onConfirm={handleLeaveGroup}
      />
      <ConfirmModal
        open={showDelete}
        title="Delete this group?"
        description="This permanently removes the group and cannot be undone."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDeleteGroup}
      />
    </div>
  );
}
