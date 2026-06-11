import { useEffect, useState } from "react";
import { VenetianMask, Clock, Flame, Send } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfessionCard from "../components/confessions/ConfessionCard";
import { fetchConfessions, postConfession } from "../api/confessions";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

const MAX_LENGTH = 1000;

function Composer({ onPosted }) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const created = await postConfession(content);
      onPosted(created);
      setContent("");
      show("Posted anonymously 🤫", "success");
    } catch (err) {
      console.error("Failed to post confession", err);
      show(err?.response?.data?.message || "Could not post confession", "error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card padded={false} className="p-5">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Confess something… nobody will know it's you. Keep it kind — targeted harassment gets removed."
          rows="3"
          className="field resize-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted">
            {content.length}/{MAX_LENGTH} · posts are anonymous to everyone
          </span>
          <Button
            type="submit"
            size="sm"
            leftIcon={Send}
            loading={posting}
            disabled={!content.trim()}
          >
            Confess
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function Confessions() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [sort]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchConfessions({ sort, page, limit: 10 });
        setConfessions(response.items);
        setMeta(response.meta);
      } catch (err) {
        console.error("Failed to fetch confessions", err);
        setConfessions([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sort, page]);

  const handlePosted = (created) => {
    setConfessions((prev) => [created, ...prev]);
  };

  const handleChanged = (updated) => {
    setConfessions((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
  };

  const handleDeleted = (id) => {
    setConfessions((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HubTabs hub="campus" />
      <PageHeader
        eyebrow="Community"
        title="Confessions"
        subtitle="The anonymous campus feed — say it without saying it was you."
        icon={VenetianMask}
        actions={
          <Segmented
            options={[
              { value: "newest", label: "Latest", icon: Clock },
              { value: "top", label: "Top", icon: Flame },
            ]}
            value={sort}
            onChange={setSort}
          />
        }
      />

      <Composer onPosted={handlePosted} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={VenetianMask}
          title="No confessions yet"
          description="The feed is squeaky clean. Be the first to break the silence — anonymously."
        />
      ) : (
        <>
          <div className="space-y-4">
            {confessions.map((confession) => (
              <ConfessionCard
                key={confession._id}
                confession={confession}
                onChanged={handleChanged}
                onDeleted={handleDeleted}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
