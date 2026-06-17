import { useEffect, useState } from "react";
import { MessagesSquare, Plus, Search, HelpCircle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Segmented from "../components/ui/Segmented";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import QuestionCard from "../components/forum/QuestionCard";
import AskQuestionModal from "../components/forum/AskQuestionModal";
import { BRANCHES } from "../components/studyVault/constants";
import { fetchQuestions, askQuestion, upvoteQuestion } from "../api/forum";
import { useToast } from "../components/ui/useToast";
import HubTabs from "../components/nav/HubTabs";

export default function Forum() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [branch, setBranch] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showAsk, setShowAsk] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [sort, branch, debouncedSearch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchQuestions({
          sort,
          branch,
          search: debouncedSearch || undefined,
          page,
          limit: 10,
        });
        setQuestions(response.items);
        setMeta(response.meta);
      } catch (err) {
        console.error("Failed to fetch questions", err);
        setQuestions([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sort, branch, debouncedSearch, page]);

  const handleAsk = async (payload) => {
    const created = await askQuestion(payload);
    setQuestions((prev) => [created, ...prev]);
    show("Question posted", "success");
  };

  const handleUpvote = async (question) => {
    try {
      const result = await upvoteQuestion(question._id);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === question._id ? { ...q, ...result } : q
        )
      );
    } catch (err) {
      console.error("Upvote failed", err);
      show("Could not upvote", "error");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubTabs hub="study" />
      <PageHeader
        eyebrow="Academics"
        title="Course Q&A"
        subtitle="Ask doubts, share answers — tagged by branch, subject & semester."
        icon={MessagesSquare}
        actions={
          <Button leftIcon={Plus} onClick={() => setShowAsk(true)}>
            Ask question
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "newest", label: "Newest" },
            { value: "top", label: "Top" },
            { value: "unanswered", label: "Unanswered" },
          ]}
          value={sort}
          onChange={setSort}
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="field pl-9"
            />
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            aria-label="Filter by branch"
            className="field w-32"
          >
            <option value="All">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions yet"
          description="No doubts match this filter. Ask away — someone on campus knows."
          action={
            <Button leftIcon={Plus} onClick={() => setShowAsk(true)}>
              Ask a question
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onUpvote={handleUpvote}
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

      <AskQuestionModal
        open={showAsk}
        onClose={() => setShowAsk(false)}
        onSubmit={handleAsk}
      />
    </div>
  );
}
