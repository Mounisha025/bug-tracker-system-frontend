
import {
  Clock,
  User,
  Activity,
  CheckCircle2,
  MessageSquare,
  FileEdit,
  PlusCircle,
} from "lucide-react";

const ActivityTimeline = ({ activities = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getActionIcon = (action = "") => {
    const normalizedAction = action.toUpperCase();

    if (
      normalizedAction.includes("CREATE") ||
      normalizedAction.includes("OPEN")
    ) {
      return (
        <PlusCircle
          size={13}
          className="text-sky-600 dark:text-sky-400"
        />
      );
    }

    if (
      normalizedAction.includes("STATUS") ||
      normalizedAction.includes("RESOLVED")
    ) {
      return (
        <CheckCircle2
          size={13}
          className="text-emerald-600 dark:text-emerald-400"
        />
      );
    }

    if (normalizedAction.includes("COMMENT")) {
      return (
        <MessageSquare
          size={13}
          className="text-indigo-600 dark:text-indigo-400"
        />
      );
    }

    if (
      normalizedAction.includes("ASSIGN") ||
      normalizedAction.includes("UPDATE")
    ) {
      return (
        <FileEdit
          size={13}
          className="text-amber-600 dark:text-amber-400"
        />
      );
    }

    return (
      <Clock
        size={13}
        className="text-slate-500 dark:text-slate-400"
      />
    );
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Activity size={23} />
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No activity recorded yet
        </p>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
          Changes to status, assignments, and comments will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-5 pl-7 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {activities.map((activity, index) => {
        const userName = activity.user?.name || "System";
        const initial = userName.charAt(0).toUpperCase();

        return (
          <div
            key={activity.id || index}
            className="group relative"
          >
            {/* Timeline marker */}
            <div className="absolute -left-7 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-300 bg-white shadow-sm transition-colors group-hover:border-indigo-500 dark:border-indigo-500/60 dark:bg-slate-900 dark:group-hover:border-indigo-400">
              {getActionIcon(activity.action)}
            </div>

            {/* Activity card */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <span className="break-words text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                  {activity.action || "Update"}
                </span>

                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Clock size={11} />
                  {formatDate(activity.createdAt)}
                </span>
              </div>

              {activity.description && (
                <p className="break-words text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {activity.description}
                </p>
              )}

              {/* Actor information */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-[9px] font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {initial || <User size={10} />}
                </div>

                <span>
                  By{" "}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {userName}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
