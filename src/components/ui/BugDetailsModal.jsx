
import { useEffect, useState, useCallback } from "react";
import {
  X,
  Bug,
  Folder,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  Activity,
} from "lucide-react";

import { UPLOADS_BASE_URL } from "../../api/axios";
import { getActivitiesByBug } from "../../api/activityApi";
import { getErrorMessage } from "../../utils/errorHandler";
import ActivityTimeline from "./ActivityTimeline";
import CommentSection from "../comments/CommentSection";

const BugDetailsModal = ({ bug, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("comments");
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const fetchActivities = useCallback(async () => {
    if (!bug?.id) return;

    setLoadingActivities(true);

    try {
      const response = await getActivitiesByBug(bug.id);
      setActivities(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(
        "Fetch activities error:",
        getErrorMessage(error)
      );
    } finally {
      setLoadingActivities(false);
    }
  }, [bug?.id]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (!bug) return null;

  const normPriority = (bug.priority || "LOW").toUpperCase();
  const normStatus = (bug.status || "OPEN").toUpperCase();

  const getPriorityBadge = () => {
    switch (normPriority) {
      case "HIGH":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
          dot: "bg-rose-500",
          label: "High Priority",
        };

      case "MEDIUM":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
          dot: "bg-amber-500",
          label: "Medium Priority",
        };

      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
          dot: "bg-emerald-500",
          label: "Low Priority",
        };
    }
  };

  const getStatusBadge = () => {
    switch (normStatus) {
      case "IN_PROGRESS":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
          icon: <Clock size={14} />,
          label: "In Progress",
        };

      case "RESOLVED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
          icon: <CheckCircle2 size={14} />,
          label: "Resolved",
        };

      default:
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
          icon: <AlertCircle size={14} />,
          label: "Open / To Do",
        };
    }
  };

  const priorityStyle = getPriorityBadge();
  const statusStyle = getStatusBadge();

  const assigneeName =
    typeof bug.assignedTo === "object"
      ? bug.assignedTo?.name
      : bug.assignedTo;

  const assigneeEmail =
    typeof bug.assignedTo === "object"
      ? bug.assignedTo?.email
      : null;

  const assigneeInitial = assigneeName
    ? assigneeName.charAt(0).toUpperCase()
    : null;

  const projectName =
    typeof bug.project === "object"
      ? bug.project?.name
      : bug.project || "General";

  const surfaceClass =
    "rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  const secondaryText =
    "text-slate-600 dark:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-2 backdrop-blur-sm dark:bg-black/75 sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-details-title"
        className="flex max-h-[95vh] w-full max-w-6xl animate-in fade-in zoom-in-95 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              BUG-{bug.id}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle.bg}`}
            >
              {statusStyle.icon}
              {statusStyle.label}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.bg}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}
              />
              {priorityStyle.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main content */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Main details */}
          <div className="space-y-6 p-4 sm:p-6 lg:col-span-8">
            <div>
              <h2
                id="bug-details-title"
                className="break-words text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl"
              >
                {bug.title}
              </h2>
            </div>

            {/* Description */}
            <div>
              <h3 className={labelClass}>Description</h3>

              <div className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                {bug.description || (
                  <span className="italic text-slate-500">
                    No description provided.
                  </span>
                )}
              </div>
            </div>

            {/* Attachment */}
            {bug.screenshot && (
              <div>
                <h3 className={`${labelClass} flex items-center gap-2`}>
                  <ImageIcon
                    size={15}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Attachment Preview
                </h3>

                <div className={`${surfaceClass} overflow-hidden p-3`}>
                  <a
                    href={`${UPLOADS_BASE_URL}/${bug.screenshot}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <img
                      src={`${UPLOADS_BASE_URL}/${bug.screenshot}`}
                      alt="Bug attachment"
                      className="max-h-80 w-full bg-slate-100 object-contain transition-transform duration-200 group-hover:scale-[1.01] dark:bg-black/40"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Click to open full image
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Comments and activity */}
            <div className="pt-1">
              <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("comments")}
                  aria-pressed={activeTab === "comments"}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "comments"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                >
                  <MessageSquare size={15} />
                  Comments
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  aria-pressed={activeTab === "activity"}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "activity"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                >
                  <Activity size={15} />
                  Activity History

                  {activities.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === "activity"
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    >
                      {activities.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === "comments" ? (
                <CommentSection
                  bugId={bug.id}
                  onCommentAdded={fetchActivities}
                />
              ) : loadingActivities ? (
                <div className={`${surfaceClass} p-8 text-center`}>
                  <Activity
                    size={22}
                    className="mx-auto animate-pulse text-indigo-600 dark:text-indigo-400"
                  />
                  <p className={`mt-3 text-sm ${secondaryText}`}>
                    Loading activity history...
                  </p>
                </div>
              ) : (
                <ActivityTimeline activities={activities} />
              )}
            </div>
          </div>

          {/* Issue details sidebar */}
          <aside className="space-y-6 bg-slate-50 p-4 dark:bg-slate-950/40 sm:p-6 lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Issue Details
            </h3>

            {/* Status */}
            <div>
              <p className={labelClass}>Status</p>
              <span
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${statusStyle.bg}`}
              >
                {statusStyle.icon}
                {statusStyle.label}
              </span>
            </div>

            {/* Priority */}
            <div>
              <p className={labelClass}>Priority</p>
              <span
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${priorityStyle.bg}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${priorityStyle.dot}`}
                />
                {priorityStyle.label}
              </span>
            </div>

            {/* Project */}
            <div>
              <p className={labelClass}>Project</p>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Folder size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {projectName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Target Workspace
                  </p>
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <p className={labelClass}>Assignee</p>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-sm font-bold text-white ring-2 ring-indigo-100 dark:ring-slate-800">
                  {assigneeInitial || <User size={17} />}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {assigneeName || "Unassigned"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                    {assigneeEmail || "No email provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Created date */}
            {bug.createdAt && (
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className={labelClass}>Created</p>

                <div className={`flex items-center gap-2 text-sm ${secondaryText}`}>
                  <Clock size={15} />
                  <span>
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BugDetailsModal;
