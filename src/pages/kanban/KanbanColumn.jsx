
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Folder,
  User,
  GripVertical,
} from "lucide-react";

const KanbanColumn = ({ title, bugs = [] }) => {
  const getColumnConfig = (colTitle) => {
    switch (colTitle) {
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" />,
          accentBar: "bg-amber-500",
          badgeBg:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
          headerBorder: "border-amber-200 dark:border-amber-500/20",
        };

      case "RESOLVED":
        return {
          label: "Resolved",
          icon: <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />,
          accentBar: "bg-emerald-500",
          badgeBg:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          headerBorder: "border-emerald-200 dark:border-emerald-500/20",
        };

      default:
        return {
          label: "To Do / Open",
          icon: <AlertCircle size={16} className="text-sky-600 dark:text-sky-400" />,
          accentBar: "bg-sky-500",
          badgeBg:
            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
          headerBorder: "border-sky-200 dark:border-sky-500/20",
        };
    }
  };

  const config = getColumnConfig(title);

  const getPriorityBadge = (priority) => {
    switch ((priority || "LOW").toUpperCase()) {
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
          label: "Med",
        };

      default:
        return {
          bg: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          dot: "bg-emerald-500",
          label: "Low",
        };
    }
  };

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      {/* Column accent */}
      <div className={`h-1 w-full ${config.accentBar}`} />

      {/* Column header */}
      <div
        className={`flex items-center justify-between border-b bg-white px-4 py-4 dark:bg-slate-900 ${config.headerBorder}`}
      >
        <div className="flex items-center gap-2.5">
          {config.icon}
          <h2 className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-100">
            {config.label}
          </h2>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badgeBg}`}
        >
          {bugs.length}
        </span>
      </div>

      {/* Droppable lane */}
      <Droppable droppableId={title}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-[300px] flex-1 flex-col gap-3 p-3 transition-colors duration-200 sm:min-h-[400px] lg:min-h-[500px] ${snapshot.isDraggingOver
                ? "bg-blue-50 ring-2 ring-inset ring-blue-300 dark:bg-blue-950/30 dark:ring-blue-500/40"
                : "bg-slate-50 dark:bg-slate-950/40"
              }`}
          >
            {bugs.map((bug, index) => {
              const priorityStyle = getPriorityBadge(bug.priority);

              const assigneeName =
                typeof bug.assignedTo === "object"
                  ? bug.assignedTo?.name
                  : bug.assignedTo;

              const initial = assigneeName
                ? assigneeName.charAt(0).toUpperCase()
                : null;

              const projectName =
                typeof bug.project === "object"
                  ? bug.project?.name
                  : bug.project || "General";

              return (
                <Draggable
                  key={bug.id}
                  draggableId={String(bug.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group select-none rounded-xl border bg-white p-3.5 transition-colors duration-150 dark:bg-slate-900 ${snapshot.isDragging
                          ? "z-50 rotate-1 scale-[1.02] border-blue-400 shadow-xl ring-2 ring-blue-400/30 dark:border-blue-500 dark:bg-slate-800"
                          : "border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:hover:border-slate-500"
                        } cursor-grab active:cursor-grabbing`}
                    >
                      {/* Issue ID and priority */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <GripVertical
                            size={13}
                            className="shrink-0 text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 dark:text-slate-500"
                          />

                          <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-1 font-mono text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            BUG-{bug.id}
                          </span>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${priorityStyle.bg}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}
                          />
                          {priorityStyle.label}
                        </span>
                      </div>

                      {/* Bug title */}
                      <h3
                        title={bug.title}
                        className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300"
                      >
                        {bug.title}
                      </h3>

                      {/* Bug description */}
                      {bug.description && (
                        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {bug.description}
                        </p>
                      )}

                      {/* Project and assignee */}
                      <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                        <div
                          className="flex min-w-0 max-w-[55%] items-center gap-1.5 text-slate-600 dark:text-slate-400"
                          title={projectName}
                        >
                          <Folder
                            size={13}
                            className="shrink-0 text-blue-600 dark:text-blue-400"
                          />
                          <span className="truncate text-[11px] font-medium">
                            {projectName}
                          </span>
                        </div>

                        <div
                          className="flex min-w-0 items-center gap-1.5"
                          title={assigneeName || "Unassigned"}
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                            {initial || <User size={12} />}
                          </div>

                          <span className="max-w-[85px] truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {assigneeName || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}

            {provided.placeholder}

            {/* Empty state */}
            {bugs.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <AlertCircle size={19} />
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No issues in {config.label}
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Drag issues here to update status
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
