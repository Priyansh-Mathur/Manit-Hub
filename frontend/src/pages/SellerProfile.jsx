import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Store,
  Trophy,
  Library,
  MessagesSquare,
  MessageSquareText,
  PartyPopper,
  CarFront,
  Package,
  BadgeCheck,
  UserPlus,
  Check,
  Clock,
  MessageCircle,
  Users,
  Lock,
} from "lucide-react";
import { usersApi } from "../api/users";
import { friendsApi } from "../api/friends";
import { useToast } from "../components/ui/useToast";
import ListingCard from "../components/marketplace/ListingCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

const levelFor = (points) => {
  if (points >= 1000) return "MANIT Legend";
  if (points >= 500) return "Campus Hero";
  if (points >= 100) return "Rising Star";
  if (points > 0) return "Contributor";
  return "Fresher";
};

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-surface px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-primary-600" />
      <div className="min-w-0">
        <p className="font-display text-base font-extrabold leading-none text-fg">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none");
  const [friendBusy, setFriendBusy] = useState(false);
  const [friendsList, setFriendsList] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await usersApi.getProfile(id);
        const data = res.data?.data || null;
        setProfile(data);
        if (data?.user?.friendStatus) setFriendStatus(data.user.friendStatus);
      } catch (err) {
        console.error("Failed to load seller profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  // Friends list is privacy-gated server-side, so load it separately.
  useEffect(() => {
    let cancelled = false;
    friendsApi
      .listOf(id)
      .then((res) => {
        if (!cancelled) setFriendsList(res.data?.data || null);
      })
      .catch((err) => console.error("Failed to load friends list", err));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const runFriendAction = async (fn, optimistic, okMsg) => {
    setFriendBusy(true);
    try {
      await fn();
      setFriendStatus(optimistic);
      show(okMsg, "success");
    } catch (err) {
      console.error("Friend action failed", err);
      show(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setFriendBusy(false);
    }
  };

  const renderFriendButton = () => {
    if (friendStatus === "self") return null;
    if (friendStatus === "friends") {
      return (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={MessageCircle}
          onClick={async () => {
            try {
              await friendsApi.startChat(id);
              navigate("/messages");
            } catch {
              show("Could not start chat", "error");
            }
          }}
        >
          Message
        </Button>
      );
    }
    if (friendStatus === "outgoing") {
      return (
        <Button size="sm" variant="secondary" leftIcon={Clock} disabled>
          Requested
        </Button>
      );
    }
    if (friendStatus === "incoming") {
      return (
        <Button
          size="sm"
          leftIcon={Check}
          loading={friendBusy}
          onClick={() => runFriendAction(() => friendsApi.accept(id), "friends", "Friend added")}
        >
          Accept request
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        leftIcon={UserPlus}
        loading={friendBusy}
        onClick={() => runFriendAction(() => friendsApi.send(id), "outgoing", "Request sent")}
      >
        Add friend
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner size={28} />
        <p className="text-sm text-muted">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted">Seller not found.</p>
        <Button leftIcon={ArrowLeft} onClick={() => navigate("/marketplace")}>
          Back to marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={ArrowLeft}
        onClick={() => navigate("/marketplace")}
      >
        Back to marketplace
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={profile.user.avatarUrl || profile.user.avatar}
              name={profile.user.displayName}
              size="xl"
              ring
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg">
                  {profile.user.displayName}
                </h1>
                {(profile.user.points ?? 0) >= 100 && (
                  <BadgeCheck
                    size={20}
                    className="text-primary-600"
                    aria-label="Verified contributor"
                  />
                )}
                <span className="ml-auto">{renderFriendButton()}</span>
              </div>
              {profile.user.handle && (
                <p className="mt-0.5 text-sm text-muted">@{profile.user.handle}</p>
              )}
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
                <Trophy size={14} className="text-gold-500" />
                <span className="font-semibold text-fg">
                  {profile.user.points ?? 0} pts
                </span>
                · {levelFor(profile.user.points ?? 0)}
                {profile.user.memberSince && (
                  <>
                    {" "}· since{" "}
                    {new Date(profile.user.memberSince).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
              {profile.user.bio && (
                <p className="mt-2 text-sm text-muted">{profile.user.bio}</p>
              )}
              {(profile.user.badges || []).length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {profile.user.badges.map((badge) => (
                    <Badge key={badge} tone="gold">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 border-t pt-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatPill
              icon={Package}
              label="Listings"
              value={profile.stats.totalListings}
            />
            <StatPill
              icon={Library}
              label="Docs shared"
              value={profile.stats.documents ?? 0}
            />
            <StatPill
              icon={MessagesSquare}
              label="Questions"
              value={profile.stats.questions ?? 0}
            />
            <StatPill
              icon={MessageSquareText}
              label="Answers"
              value={profile.stats.answers ?? 0}
            />
            <StatPill
              icon={PartyPopper}
              label="Events"
              value={profile.stats.events ?? 0}
            />
            <StatPill
              icon={CarFront}
              label="Rides"
              value={profile.stats.rides ?? 0}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
            <QrCode size={16} className="text-primary-600" />
            Payment info
          </h2>
          {profile.paymentInfo?.upiId && (
            <p className="text-sm text-muted">
              UPI ID:{" "}
              <span className="font-medium text-fg">
                {profile.paymentInfo.upiId}
              </span>
            </p>
          )}
          {profile.paymentInfo?.upiQrUrl && (
            <img
              src={profile.paymentInfo.upiQrUrl}
              alt="UPI QR"
              className="mt-3 h-40 w-40 rounded-xl border object-cover"
            />
          )}
          {!profile.paymentInfo?.upiId && !profile.paymentInfo?.upiQrUrl && (
            <p className="text-sm text-muted">No payment info shared.</p>
          )}
        </Card>
      </div>

      {friendsList && friendsList.count > 0 && (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary-600" />
            <h2 className="font-display text-lg font-bold text-fg">
              Friends
            </h2>
            <Badge tone="neutral">{friendsList.count}</Badge>
          </div>
          {friendsList.hidden ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Lock size={14} />
              This profile's friends list is private.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {friendsList.friends.map((f) => (
                <button
                  key={f._id}
                  type="button"
                  onClick={() => navigate(`/sellers/${f._id}`)}
                  className="ring-focus flex items-center gap-3 rounded-xl border bg-surface p-2.5 text-left transition hover:border-primary-500/40"
                >
                  <Avatar src={f.avatarUrl} name={f.displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">
                      {f.displayName}
                    </p>
                    {f.handle && (
                      <p className="truncate text-xs text-muted">@{f.handle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-fg">Listings</h2>
        {profile.listings.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No active listings"
            description="This seller has no items listed right now."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profile.listings.map((listing) => (
              <ListingCard key={listing._id} item={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
