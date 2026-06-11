import { ArrowBigUp, MessageSquareText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

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

export default function QuestionCard({ question, onUpvote }) {
  const answered = question.answersCount > 0;
  const solved = !!question.acceptedAnswer;

  return (
    <div className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onUpvote?.(question);
          }}
          aria-label={question.myUpvote ? "Remove upvote" : "Upvote question"}
          className={cn(
            "ring-focus flex h-10 w-10 flex-col items-center justify-center rounded-xl border transition",
            question.myUpvote
              ? "border-primary-600 bg-primary-600/10 text-primary-600"
              : "text-muted hover:text-fg"
          )}
        >
          <ArrowBigUp size={18} className={question.myUpvote ? "fill-current" : ""} />
        </button>
        <span className="text-xs font-bold text-fg">{question.upvoteCount}</span>
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/forum/${question._id}`}
          className="ring-focus block rounded-lg font-display text-base font-bold leading-snug text-fg hover:text-primary-600"
        >
          {question.title}
        </Link>

        {question.body && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{question.body}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {solved ? (
            <Badge tone="success">
              <CheckCircle2 size={11} className="mr-0.5" /> Solved
            </Badge>
          ) : (
            <Badge tone={answered ? "primary" : "warning"}>
              <MessageSquareText size={11} className="mr-0.5" />
              {question.answersCount}{" "}
              {question.answersCount === 1 ? "answer" : "answers"}
            </Badge>
          )}
          {question.subject && <Badge tone="neutral">{question.subject}</Badge>}
          {question.branch && <Badge tone="neutral">{question.branch}</Badge>}
          {question.semester && (
            <Badge tone="neutral">Sem {question.semester}</Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
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
      </div>
    </div>
  );
}
