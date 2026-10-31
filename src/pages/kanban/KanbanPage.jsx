
import { useContext, useState, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import {
  Search,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";
import { BugContext } from "../../context/BugContext";
import { AuthContext } from "../../context/AuthContext";
import KanbanColumn from "./KanbanColumn";

const KanbanPage = () => {
  const { bugs, setBugs } = useContext(BugContext);
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [loading, setLoading] = useState(false);

  const refreshBugs = async () => {
    setLoading(true);

    try {
      const data = await bugService.getBugs();
      setBugs(Array.isArray(data) ? data : []);
      toast.success("Board refreshed");
    } catch (error) {
      console.error("Failed to refresh bugs:", getErrorMessage(error));
      toast.error(getErrorMessage(error) || "Failed to refresh board");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const bugId = Number(draggableId);
    const newStatus = destination.droppableId;
    const bug = bugs.find((b) => b.id === bugId);

    if (!bug || bug.status === newStatus) return;

    const previousBugs = [...bugs];

    const updatedBug = {
      ...bug,
      status: newStatus,
    };

    setBugs((current) =>
      current.map((b) => (b.id === bugId ? updatedBug : b))
    );

    const statusLabels = {
      OPEN: "To Do / Open",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
    };

    try {
      const updated = await bugService.updateBug(bugId, updatedBug);

      setBugs((current) =>
        current.map((b) => (b.id === bugId ? updated : b))
      );

      toast.success(
        `Moved BUG-${bugId} to ${statusLabels[newStatus] || newStatus}`
      );
    } catch (error) {
      setBugs(previousBugs);

      const msg = getErrorMessage(error);
      console.error("Failed to update status on drag:", msg);
      toast.error(msg || "Failed to update bug status");
    }
  };

  const filteredBugs = useMemo(() => {
    let list = bugs || [];

    if (user?.role === "DEVELOPER") {
      list = list.filter(
        (b) =>
          b.assignedTo?.email?.toLowerCase() === user.email?.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          String(b.id).includes(q) ||
          (typeof b.project === "object"
            ? b.project?.name?.toLowerCase().includes(q)
            : b.project?.toLowerCase().includes(q))
      );
    }

    if (filterPriority !== "All") {
      list = list.filter(
        (b) => b.priority?.toUpperCase() === filterPriority.toUpperCase()
      );
    }

    return list;
  }, [bugs, user, search, filterPriority]);

  const openBugs = useMemo(
    () => filteredBugs.filter((bug) => bug.status === "OPEN"),
    [filteredBugs]
  );

  const inProgressBugs = useMemo(
    () => filteredBugs.filter((bug) => bug.status === "IN_PROGRESS"),
    [filteredBugs]
  );

  const resolvedBugs = useMemo(
    () => filteredBugs.filter((bug) => bug.status === "RESOLVED"),
    [filteredBugs]
  );

  const hasFilters = search.trim() !== "" || filterPriority !== "All";

  const summaryCards = [
    {
      title: "To Do",
      count: openBugs.length,
      Icon: AlertCircle,
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "In Progress",
      count: inProgressBugs.length,
      Icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Resolved",
      count: resolvedBugs.length,
      Icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 bg-transparent text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Kanban Board
            </h1>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              {filteredBugs.length} cards
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Drag and drop defect cards across columns to update workflow status.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshBugs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
          title="Refresh board"
          aria-label="Refresh board"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin text-blue-500" : ""}
          />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map(({ title, count, Icon, color }) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2.5">
              <Icon size={17} className={color} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </span>
            </div>

            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          />

          <input
            type="text"
            aria-label="Search board cards"
            placeholder="Search board cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Filter size={14} />
            Priority:
          </span>

          {["All", "High", "Medium", "Low"].map((priority) => {
            const active = filterPriority === priority;

            return (
              <button
                type="button"
                key={priority}
                onClick={() => setFilterPriority(priority)}
                aria-pressed={active}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
              >
                {priority}
              </button>
            );
          })}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterPriority("All");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          <KanbanColumn title="OPEN" bugs={openBugs} />
          <KanbanColumn title="IN_PROGRESS" bugs={inProgressBugs} />
          <KanbanColumn title="RESOLVED" bugs={resolvedBugs} />
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;
