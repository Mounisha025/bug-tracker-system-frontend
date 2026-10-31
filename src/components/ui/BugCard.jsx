
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  Pencil,
  Trash2,
  Eye,
  Folder,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const BugCard = ({
  id,
  title,
  description,
  priority = "LOW",
  status = "OPEN",
  assignedTo,
  project,
  deleteBug,
  editBug,
  changeStatus,
  viewBugDetails,
}) => {
  const { user } = useContext(AuthContext);

  const normPriority = (priority || "LOW").toUpperCase();
  const normStatus = (status || "OPEN").toUpperCase();

  const getPriorityBadge = () => {
    switch (normPriority) {
      case "HIGH":
        return {
          bg: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
          dot: "bg-rose-500",
          label: "High",
        };
      case "MEDIUM":
        return {
          bg: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
          dot: "bg-amber-500",
          label: "Medium",
        };
      default:
        return {
          bg: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          dot: "bg-emerald-500",
          label: "Low",
        };
    }
  };

  const getStatusBadge = () => {
    switch (normStatus) {
      case "IN_PROGRESS":
        return {
          bg: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
          icon: <Clock size={12} />,
          label: "In Progress",
        };
      case "RESOLVED":
        return {
          bg: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          icon: <CheckCircle2 size={12} />,
          label: "Resolved",
        };
      default:
        return {
          bg: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
          icon: <AlertCircle size={12} />,
          label: "Open",
        };
    }
  };

  const priorityStyle = getPriorityBadge();
  const statusStyle = getStatusBadge();

  const assigneeName =
    typeof assignedTo === "object" ? assignedTo?.name : assignedTo;

  const initial = assigneeName
    ? assigneeName.charAt(0).toUpperCase()
    : null;

  const projectName =
    typeof project === "object" ? project?.name : project || "General";

  const canEditStatus =
    Boolean(changeStatus) &&
    (user?.role === "ADMIN" || user?.role === "DEVELOPER");

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500">
      <div>
        {/* Issue ID and priority */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            BUG-{id}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
            {priorityStyle.label}
          </span>
        </div>

        {/* Bug title */}
        <h3
          onClick={() => viewBugDetails?.(id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              viewBugDetails?.(id);
            }
          }}
          role={viewBugDetails ? "button" : undefined}
          tabIndex={viewBugDetails ? 0 : undefined}
          className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300"
          title={title}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}

        {/* Project */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Folder size={14} className="shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="max-w-[200px] truncate" title={projectName}>
            {projectName}
          </span>
        </div>
      </div>

      {/* Assignee, status and actions */}
      <div className="mt-5 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          {/* Assignee */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {initial || <User size={14} />}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assignee
              </p>
              <p
                className="max-w-[120px] truncate text-xs font-medium text-slate-800 dark:text-slate-200"
                title={assigneeName || "Unassigned"}
              >
                {assigneeName || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="relative min-w-0">
            {canEditStatus ? (
              <>
                <select
                  aria-label={`Change status for bug ${id}`}
                  value={normStatus}
                  onChange={(event) => changeStatus(id, event.target.value)}
                  className={`max-w-[145px] appearance-none rounded-lg border py-2 pl-2.5 pr-7 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500/20 ${statusStyle.bg}`}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                />
              </>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold ${statusStyle.bg}`}
              >
                {statusStyle.icon}
                {statusStyle.label}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {viewBugDetails && (
            <button
              type="button"
              onClick={() => viewBugDetails(id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
              title="View bug details"
            >
              <Eye size={14} />
              Details
            </button>
          )}

          {user?.role === "ADMIN" && editBug && (
            <button
              type="button"
              onClick={() => editBug(id)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
              title="Edit bug"
              aria-label="Edit bug"
            >
              <Pencil size={15} />
            </button>
          )}

          {user?.role === "ADMIN" && deleteBug && (
            <button
              type="button"
              onClick={() => deleteBug(id)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              title="Delete bug"
              aria-label="Delete bug"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugCard;
