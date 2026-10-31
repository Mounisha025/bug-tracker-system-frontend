
import { Eye, ArrowRight, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentBugsTable = ({ bugs = [] }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    const styles = {
      HIGH: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400",
      MEDIUM:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
      LOW: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    };

    const dotStyles = {
      HIGH: "bg-rose-500",
      MEDIUM: "bg-amber-500",
      LOW: "bg-emerald-500",
    };

    const label =
      priority === "HIGH"
        ? "High"
        : priority === "MEDIUM"
          ? "Medium"
          : priority === "LOW"
            ? "Low"
            : priority || "Normal";

    return (
      <span
        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority] ||
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotStyles[priority] || "bg-slate-400"
            }`}
        />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      OPEN: {
        label: "Open",
        style:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        dot: "bg-blue-500",
      },
      IN_PROGRESS: {
        label: "In Progress",
        style:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
        dot: "bg-amber-500",
      },
      RESOLVED: {
        label: "Resolved",
        style:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        dot: "bg-emerald-500",
      },
    };

    const item = config[status];

    return (
      <span
        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${item?.style ||
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${item?.dot || "bg-slate-400"
            }`}
        />
        {item?.label || status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/70">
      {/* Table header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Bugs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest issues logged across your projects
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/bugs")}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          View All Bugs
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
              {["Defect", "Priority", "Status", "Assigned To", "Action"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${heading === "Action" ? "text-right" : ""
                      }`}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {bugs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                    <Bug size={24} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No bugs recorded yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Newly reported bugs will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              bugs.slice(0, 5).map((bug) => (
                <tr
                  key={bug.id}
                  className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  {/* Defect */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                        <Bug size={17} />
                      </div>

                      <div className="min-w-0 max-w-xs">
                        <p className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                          {bug.title || "Untitled bug"}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          {bug.project?.name
                            ? `Project: ${bug.project.name}`
                            : bug.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-4">
                    {getPriorityBadge(bug.priority)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {getStatusBadge(bug.status)}
                  </td>

                  {/* Assignee */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {bug.assignedTo?.name?.trim()?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </div>

                      <span className="max-w-[120px] truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                        {bug.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate("/bugs")}
                      title="View in Bugs Management"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {bugs.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30 sm:px-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {Math.min(bugs.length, 5)} of {bugs.length} bugs
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentBugsTable;
