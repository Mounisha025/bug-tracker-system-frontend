
import { useEffect, useState, useContext, useCallback } from "react";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Loader2,
} from "lucide-react";

import commentService from "../../services/commentService";
import { getErrorMessage } from "../../utils/errorHandler";
import { AuthContext } from "../../context/AuthContext";

const CommentSection = ({ bugId, onCommentAdded }) => {
  const { user } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!bugId) {
      setComments([]);
      return;
    }

    setLoading(true);

    try {
      const data = await commentService.getCommentsByBug(bugId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch comments error:", getErrorMessage(error));
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [bugId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (event) => {
    event?.preventDefault();

    if (!message.trim() || submitting) return;

    setSubmitting(true);

    try {
      const created = await commentService.addComment({
        message: message.trim(),
        bug: {
          id: bugId,
        },
        user: {
          id: user?.id,
        },
      });

      setComments((previous) => [...previous, created]);
      setMessage("");
      toast.success("Comment added");

      if (typeof onCommentAdded === "function") {
        onCommentAdded(created);
      }
    } catch (error) {
      const err = getErrorMessage(error);
      console.error("Add comment error:", err);
      toast.error(err || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-8 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            <Loader2
              size={19}
              className="animate-spin text-indigo-600 dark:text-indigo-400"
            />
            <span className="text-xs">Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const authorName = comment.user?.name || "Anonymous";
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div
                key={comment.id}
                className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-indigo-50 dark:ring-slate-800">
                      {initial || <User size={12} />}
                    </div>

                    <span className="break-words text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {authorName}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock size={11} />
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="break-words pl-9 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {comment.message}
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-9 text-center dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <MessageSquare size={20} />
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No comments yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Start the discussion by leaving a note below.
            </p>
          </div>
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleAddComment} className="pt-1">
        <div className="rounded-xl border border-slate-200 bg-white p-2 transition-colors focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950/60 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/10">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
              ) {
                event.preventDefault();
                handleAddComment();
              }
            }}
            placeholder="Write a comment... (Ctrl+Enter to post)"
            rows={3}
            maxLength={5000}
            className="w-full resize-y bg-transparent p-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-200 dark:placeholder:text-slate-500"
            disabled={submitting}
            aria-label="Write a comment"
          />

          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-1 pt-2 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Press{" "}
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Ctrl+Enter
              </kbd>{" "}
              to submit
            </span>

            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>{submitting ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
