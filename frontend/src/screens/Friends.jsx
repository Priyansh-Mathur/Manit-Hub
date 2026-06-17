import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Check,
  X,
  UserMinus,
  Clock,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/useToast";
import { usePresence } from "../context/usePresence";
import { friendsApi } from "../api/friends";
import { usersApi } from "../api/users";

function PersonRow({ person, right }) {
  const { isOnline } = usePresence();
  return (
    <div className="flex items-center gap-3 px-1 py-2.5">
      <Avatar
        src={person.avatarUrl}
        name={person.displayName}
        size="md"
        online={person.showDot ? isOnline(person._id) : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">
          {person.displayName}
        </p>
        {person.handle && (
          <p className="truncate text-xs text-muted">@{person.handle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">{right}</div>
    </div>
  );
}

export default function Friends() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { setOnline } = usePresence();
  const [tab, setTab] = useState("friends");

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [confirmUnfriend, setConfirmUnfriend] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        friendsApi.list(),
        friendsApi.requests(),
      ]);
      const list = friendsRes.data?.data || [];
      setFriends(list);
      setRequests(requestsRes.data?.data || { incoming: [], outgoing: [] });
      // Seed presence with the REST snapshot of who's online.
      setOnline(list.filter((f) => f.isOnline).map((f) => f._id));
    } catch (err) {
      console.error("Failed to load friends", err);
    } finally {
      setLoading(false);
    }
  }, [setOnline]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Debounced people search.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (tab !== "find" || debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setSearching(true);
      try {
        const res = await usersApi.searchUsers(debounced);
        if (!cancelled) setResults(res.data?.data || []);
      } catch (err) {
        if (!cancelled) {
          console.error("Search failed", err);
          setResults([]);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tab, debounced]);

  const act = async (id, fn, okMsg) => {
    setBusyId(id);
    try {
      await fn();
      if (okMsg) show(okMsg, "success");
      await reload();
      if (tab === "find" && debounced.length >= 2) {
        const res = await usersApi.searchUsers(debounced);
        setResults(res.data?.data || []);
      }
    } catch (err) {
      console.error("Friend action failed", err);
      show(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const startChat = async (id) => {
    try {
      await friendsApi.startChat(id);
      navigate("/messages");
    } catch (err) {
      console.error("Could not start chat", err);
      show(err?.response?.data?.message || "Could not start chat", "error");
    }
  };

  const requestCount = requests.incoming.length;

  const searchButton = (r) => {
    const busy = busyId === r._id;
    if (r.friendStatus === "friends") {
      return (
        <Button size="sm" variant="secondary" leftIcon={MessageCircle} onClick={() => startChat(r._id)}>
          Message
        </Button>
      );
    }
    if (r.friendStatus === "outgoing") {
      return (
        <Button size="sm" variant="secondary" leftIcon={Clock} disabled>
          Requested
        </Button>
      );
    }
    if (r.friendStatus === "incoming") {
      return (
        <Button size="sm" leftIcon={Check} disabled={busy} onClick={() => act(r._id, () => friendsApi.accept(r._id), "Friend added")}>
          Accept
        </Button>
      );
    }
    return (
      <Button size="sm" leftIcon={UserPlus} disabled={busy} onClick={() => act(r._id, () => friendsApi.send(r._id), "Request sent")}>
        Add friend
      </Button>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Community"
        title="Friends"
        subtitle="Find people by their @handle, send requests, and chat with friends."
        icon={Users}
      />

      <Segmented
        options={[
          { value: "friends", label: "Friends", count: friends.length },
          { value: "requests", label: "Requests", count: requestCount || undefined },
          { value: "find", label: "Find people" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "friends" &&
        (loading ? (
          <Card padded={false} className="divide-y p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="my-2 h-12 rounded-xl" />
            ))}
          </Card>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No friends yet"
            description="Search for classmates by their @handle and send a request."
            action={
              <Button leftIcon={Search} onClick={() => setTab("find")}>
                Find people
              </Button>
            }
          />
        ) : (
          <Card padded={false} className="divide-y px-3">
            {friends.map((f) => (
              <PersonRow
                key={f._id}
                person={{ ...f, showDot: true }}
                right={
                  <>
                    <Button size="sm" variant="secondary" leftIcon={MessageCircle} onClick={() => startChat(f._id)}>
                      Message
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirmUnfriend(f)}
                      aria-label={`Unfriend ${f.displayName}`}
                      className="ring-focus rounded-lg p-2 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
                    >
                      <UserMinus size={16} />
                    </button>
                  </>
                }
              />
            ))}
          </Card>
        ))}

      {tab === "requests" &&
        (loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : requestCount === 0 && requests.outgoing.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No pending requests"
            description="Friend requests you send or receive show up here."
          />
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                Incoming
                {requestCount > 0 && <Badge tone="accent">{requestCount}</Badge>}
              </h3>
              {requests.incoming.length === 0 ? (
                <p className="px-1 text-sm text-muted">No incoming requests.</p>
              ) : (
                <Card padded={false} className="divide-y px-3">
                  {requests.incoming.map((p) => (
                    <PersonRow
                      key={p._id}
                      person={p}
                      right={
                        <>
                          <Button size="sm" leftIcon={Check} disabled={busyId === p._id} onClick={() => act(p._id, () => friendsApi.accept(p._id), "Friend added")}>
                            Accept
                          </Button>
                          <button
                            type="button"
                            onClick={() => act(p._id, () => friendsApi.remove(p._id), "Request declined")}
                            aria-label="Decline"
                            className="ring-focus rounded-lg p-2 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
                          >
                            <X size={16} />
                          </button>
                        </>
                      }
                    />
                  ))}
                </Card>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Sent</h3>
              {requests.outgoing.length === 0 ? (
                <p className="px-1 text-sm text-muted">No sent requests.</p>
              ) : (
                <Card padded={false} className="divide-y px-3">
                  {requests.outgoing.map((p) => (
                    <PersonRow
                      key={p._id}
                      person={p}
                      right={
                        <Button size="sm" variant="secondary" disabled={busyId === p._id} onClick={() => act(p._id, () => friendsApi.remove(p._id), "Request cancelled")}>
                          Cancel
                        </Button>
                      }
                    />
                  ))}
                </Card>
              )}
            </div>
          </div>
        ))}

      {tab === "find" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by @handle or name…"
              className="field pl-11"
              autoFocus
            />
          </div>

          {debounced.length < 2 ? (
            <EmptyState
              icon={Search}
              title="Find your people"
              description="Type at least 2 characters to search classmates by @handle or name."
            />
          ) : searching ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description={`No one found for “${debounced}”.`}
            />
          ) : (
            <Card padded={false} className="divide-y px-3">
              {results.map((r) => (
                <PersonRow key={r._id} person={r} right={searchButton(r)} />
              ))}
            </Card>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!confirmUnfriend}
        title={`Unfriend ${confirmUnfriend?.displayName || ""}?`}
        description="You'll need to send a new request to become friends again."
        confirmText="Unfriend"
        tone="danger"
        onCancel={() => setConfirmUnfriend(null)}
        onConfirm={() => {
          const target = confirmUnfriend;
          setConfirmUnfriend(null);
          act(target._id, () => friendsApi.unfriend(target._id), "Removed from friends");
        }}
      />
    </div>
  );
}
