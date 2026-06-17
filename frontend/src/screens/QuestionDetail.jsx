import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowBigUp,
  ArrowLeft,
  CheckCircle2,
  Send,
  Trash2,
  MessagesSquare,
} from "lucide-react";
import { cn } from "../lib/cn";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuthContext } from "../context/useAuthContext";
import { useToast } from "../components/ui/useToast";
import {
  fetchQuestion,
  upvoteQuestion,
  deleteQuestion,
  addAnswer,
  upvoteAnswer,
  acceptAnswer,
  deleteAnswer,
} from "../api/forum";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

function UpvotePill({ count, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "ring-focus inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
        active
          ? "border-primary-600 bg-primary-600/10 text-primary-600"
          : "text-muted hover:text-fg"
      )}
    >
      <ArrowBigUp size={14} className={active ? "fill-current" : ""} />
      {count}
    </button>
  );
}

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { show } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // {type, id}

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setData(await fetchQuestion(id));
      } catch (err) {
        console.error("Failed to load question", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    );
  }

  if (!data?.question) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Question not found"
        description="It may have been removed."
        action={
          <Button onClick={() => navigate("/forum")} leftIcon={ArrowLeft}>
            Back to forum
          </Button>
        }
      />
    );
  }

  const { question, answers } = data;
  const isAuthor = user && question.author?._id === user._id;

  const handleUpvoteQuestion = async () => {
    try {
      const result = await upvoteQuestion(question._id);
      setData((prev) => ({
        ...prev,
        question: { ...prev.question, ...result },
      }));
    } catch (err) {
      console.error("Upvote failed", err);
      show("Could not upvote", "error");
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim() || sending) return;
    setSending(true);
    try {
      const created = await addAnswer(question._id, answerBody);
      setData((prev) => ({
        ...prev,
        question: {
          ...prev.question,
          answersCount: prev.question.answersCount + 1,
        },
        answers: [...prev.answers, created],
      }));
      setAnswerBody("");
      show("Answer posted", "success");
    } catch (err) {
      console.error("Answer failed", err);
      show(err?.response?.data?.message || "Could not post answer", "error");
    } finally {
      setSending(false);
    }
  };

  const handleUpvoteAnswer = async (answer) => {
    try {
      const result = await upvoteAnswer(answer._id);
      setData((prev) => ({
        ...prev,
        answers: prev.answers.map((a) =>
          a._id === answer._id ? { ...a, ...result } : a
        ),
      }));
    } catch (err) {
      console.error("Upvote failed", err);
      show("Could not upvote", "error");
    }
  };

  const handleAccept = async (answer) => {
    try {
      const result = await acceptAnswer(answer._id);
      const acceptedId = result.acceptedAnswer;
      setData((prev) => ({
        ...prev,
        question: { ...prev.question, acceptedAnswer: acceptedId },
        answers: prev.answers.map((a) => ({
          ...a,
          isAccepted: a._id === acceptedId,
        })),
      }));
      show(acceptedId ? "Answer accepted ✅" : "Acceptance removed", "success");
    } catch (err) {
      console.error("Accept failed", err);
      show(err?.response?.data?.message || "Could not accept answer", "error");
    }
  };

  const handleDelete = async () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      if (target.type === "question") {
        await deleteQuestion(target.id);
        show("Question deleted", "success");
        navigate("/forum");
      } else {
        await deleteAnswer(target.id);
        setData((prev) => ({
          ...prev,
          question: {
            ...prev.question,
            answersCount: Math.max(0, prev.question.answersCount - 1),
          },
          answers: prev.answers.filter((a) => a._id !== target.id),
        }));
        show("Answer deleted", "success");
      }
    } catch (err) {
      console.error("Delete failed", err);
      show("Could not delete", "error");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to="/forum"
        className="ring-focus inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted transition hover:text-fg"
      >
        <ArrowLeft size={15} /> Back to Q&A
      </Link>

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-xl font-bold leading-snug text-fg">
            {question.title}
          </h1>
          {isAuthor && (
            <button
              type="button"
              onClick={() => setConfirmDelete({ type: "question", id: question._id })}
              aria-label="Delete question"
              className="ring-focus shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-danger-500/10 hover:text-danger-600"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {question.body && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-fg">
            {question.body}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {question.subject && <Badge tone="neutral">{question.subject}</Badge>}
          {question.branch && <Badge tone="neutral">{question.branch}</Badge>}
          {question.semester && (
            <Badge tone="neutral">Sem {question.semester}</Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Avatar
              src={question.author?.avatarUrl}
              name={question.author?.displayName || "Student"}
              size="xs"
            />
            <span className="font-medium text-fg">
              {question.author?.displayName}
            </span>
            · {timeAgo(question.createdAt)}
          </div>
          <UpvotePill
            count={question.upvoteCount}
            active={question.myUpvote}
            onClick={handleUpvoteQuestion}
            label="Upvote question"
          />
        </div>
      </div>

      <h2 className="font-display text-base font-bold text-fg">
        {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
      </h2>

      <div className="space-y-3.5">
        {answers.map((answer) => (
          <div
            key={answer._id}
            className={cn(
              "rounded-2xl border bg-card p-5 shadow-card",
              answer.isAccepted && "border-success-500/50 ring-1 ring-success-500/30"
            )}
          >
            {answer.isAccepted && (
              <Badge tone="success" className="mb-2">
                <CheckCircle2 size={11} className="mr-0.5" /> Accepted answer
              </Badge>
            )}
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-fg">
              {answer.body}
            </p>
            <div className="mt-3.5 flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Avatar
                  src={answer.author?.avatarUrl}
                  name={answer.author?.displayName || "Student"}
                  size="xs"
                />
                <span className="font-medium text-fg">
                  {answer.author?.displayName}
                </span>
                · {timeAgo(answer.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                {isAuthor && (
                  <button
                    type="button"
                    onClick={() => handleAccept(answer)}
                    aria-label={answer.isAccepted ? "Unaccept answer" : "Accept answer"}
                    title={answer.isAccepted ? "Unaccept" : "Mark as solution"}
                    className={cn(
                      "ring-focus rounded-full border p-1.5 transition",
                      answer.isAccepted
                        ? "border-success-500 bg-success-500/10 text-success-600"
                        : "text-muted hover:text-success-600"
                    )}
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}
                {user && answer.author?._id === user._id && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ type: "answer", id: answer._id })}
                    aria-label="Delete answer"
                    className="ring-focus rounded-full border p-1.5 text-muted transition hover:text-danger-600"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <UpvotePill
                  count={answer.upvoteCount}
                  active={answer.myUpvote}
                  onClick={() => handleUpvoteAnswer(answer)}
                  label="Upvote answer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAnswer}
        className="rounded-2xl border bg-card p-5 shadow-card"
      >
        <label className="mb-1.5 block text-sm font-semibold text-fg">
          Your answer
        </label>
        <textarea
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          placeholder="Explain it like you'd want it explained…"
          rows="4"
          maxLength={3000}
          className="field resize-none"
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            size="sm"
            leftIcon={Send}
            loading={sending}
            disabled={!answerBody.trim()}
          >
            Post answer
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={!!confirmDelete}
        title={
          confirmDelete?.type === "question"
            ? "Delete this question?"
            : "Delete this answer?"
        }
        description="This can't be undone."
        confirmText="Delete"
        tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
