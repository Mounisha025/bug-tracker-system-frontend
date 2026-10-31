
import {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import {
  UserCheck,
  Search,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  Smile,
} from "lucide-react";

import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";
import { AuthContext } from "../../context/AuthContext";
import BugCard from "../../components/ui/BugCard";
import BugDetailsModal from "../../components/ui/BugDetailsModal";

const MyBugsPage = () => {
  const { user } = useContext(AuthContext);

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [detailsBug, setDetailsBug] = useState(null);

  const fetchMyBugs = useCallback(async () => {
    setLoading(true);

    try {
      const data = await bugService.getBugs();
      const allBugs = Array.isArray(data) ? data : [];

      const myBugs = allBugs.filter(
        (bug) =>
          bug.assignedTo?.email?.toLowerCase() ===
          user?.email?.toLowerCase()
      );

      setBugs(myBugs);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Fetch My Bugs Error:", message);
      toast.error(message || "Failed to load assigned bugs");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchMyBugs();
    } else {
      setBugs([]);
    }
  }, [fetchMyBugs, user?.email]);

  // Update bug status
  const changeStatus = async (id, newStatus) => {
    try {
      const bugToUpdate = bugs.find(
        (bug) => String(bug.id) === String(id)
      );

      if (!bugToUpdate) return;

      const updatedBug = {
        ...bugToUpdate,
        status: newStatus,
      };

      const updated = await bugService.updateBug(id, updatedBug);

      setBugs((previousBugs) =>
        previousBugs.map((bug) =>
          String(bug.id) === String(id)
            ? { ...bug, ...(updated || updatedBug) }
            : bug
        )
      );

      toast.success(
        `Status updated to ${newStatus
          .replaceAll("_", " ")
          .toLowerCase()}`
      );
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Failed to change status:", message);
      toast.error(message || "Failed to update status");
    }
  };

  // Open bug details
  const viewBugDetails = (bugId) => {
    const bug = bugs.find(
      (item) => String(item.id) === String(bugId)
    );

    if (bug) setDetailsBug(bug);
  };

  // Search and filters
  const filteredBugs = useMemo(() => {
    let result = [...bugs];

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((bug) => {
        const projectName =
          typeof bug.project === "object"
            ? bug.project?.name
            : bug.project;

        return (
          bug.title?.toLowerCase().includes(query) ||
          bug.description?.toLowerCase().includes(query) ||
          projectName?.toLowerCase().includes(query)
        );
      });
    }

    if (filterPriority !== "All") {
      result = result.filter(
        (bug) =>
          bug.priority?.toUpperCase() ===
          filterPriority.toUpperCase()
      );
    }

    if (filterStatus !== "All") {
      result = result.filter(
        (bug) =>
          bug.status?.toUpperCase() ===
          filterStatus.toUpperCase()
      );
    }

    return result;
  }, [bugs, search, filterPriority, filterStatus]);

  // Summary counts
  const counts = useMemo(
    () => ({
      total: bugs.length,
      open: bugs.filter((bug) => bug.status === "OPEN").length,
      inProgress: bugs.filter(
        (bug) => bug.status === "IN_PROGRESS"
      ).length,
      resolved: bugs.filter(
        (bug) => bug.status === "RESOLVED"
      ).length,
    }),
    [bugs]
  );

  const hasFilters =
    search.trim() !== "" ||
    filterPriority !== "All" ||
    filterStatus !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilterPriority("All");
    setFilterStatus("All");
  };

  const summaryCards = [
    {
      label: "Assigned",
      value: counts.total,
      status: "All",
      icon: UserCheck,
      color: "indigo",
    },
    {
      label: "To Do",
      value: counts.open,
      status: "OPEN",
      icon: AlertCircle,
      color: "sky",
    },
    {
      label: "In Progress",
      value: counts.inProgress,
      status: "IN_PROGRESS",
      icon: Clock,
      color: "amber",
    },
    {
      label: "Resolved",
      value: counts.resolved,
      status: "RESOLVED",
      icon: CheckCircle2,
      color: "emerald",
    },
  ];

  const colorStyles = {
    indigo: {
      icon: "text-indigo-600 dark:text-indigo-400",
      active:
        "border-indigo-300 dark:border-indigo-500/50 ring-1 ring-indigo-100 dark:ring-indigo-500/10",
    },
    sky: {
      icon: "text-sky-600 dark:text-sky-400",
      active:
        "border-sky-300 dark:border-sky-500/50 ring-1 ring-sky-100 dark:ring-sky-500/10",
    },
    amber: {
      icon: "text-amber-600 dark:text-amber-400",
      active:
        "border-amber-300 dark:border-amber-500/50 ring-1 ring-amber-100 dark:ring-amber-500/10",
    },
    emerald: {
      icon: "text-emerald-600 dark:text-emerald-400",
      active:
        "border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-100 dark:ring-emerald-500/10",
    },
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-4 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              My Assigned Bugs
            </h1>

            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              {filteredBugs.length}{" "}
              {filteredBugs.length === 1 ? "bug" : "bugs"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View and manage defects assigned to{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {user?.name || user?.email || "your account"}
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMyBugs}
          disabled={loading}
          title="Refresh assigned bugs"
          aria-label="Refresh assigned bugs"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const colors = colorStyles[card.color];
          const active = filterStatus === card.status;

          return (
            <button
              key={card.label}
              type="button"
              onClick={() => setFilterStatus(card.status)}
              aria-pressed={active}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${active
                  ? colors.active
                  : "border-slate-200 dark:border-slate-800"
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.label}
                </span>

                <Icon size={19} className={colors.icon} />
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {active ? "Currently selected" : "Click to filter"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by bug title, description, or project..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Filter size={15} />
              Priority
            </span>

            {["All", "High", "Medium", "Low"].map((priority) => {
              const active = filterPriority === priority;

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFilterPriority(priority)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                >
                  {priority}
                </button>
              );
            })}

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
              >
                <X size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active status filter */}
        {filterStatus !== "All" && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Status filter:
            </span>

            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              {filterStatus.replaceAll("_", " ")}
            </span>

            <button
              type="button"
              onClick={() => setFilterStatus("All")}
              className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Clear status
            </button>
          </div>
        )}
      </div>

      {/* Results heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Your bugs
        </h2>

        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredBugs.length} of {bugs.length}
        </span>
      </div>

      {/* Loading state */}
      {loading && bugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw
            size={30}
            className="animate-spin text-indigo-600 dark:text-indigo-400"
          />
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            Loading your assigned bugs...
          </p>
        </div>
      ) : filteredBugs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBugs.map((bug) => (
            <BugCard
              key={bug.id}
              id={bug.id}
              title={bug.title}
              description={bug.description}
              priority={bug.priority}
              status={bug.status}
              assignedTo={bug.assignedTo}
              project={bug.project}
              changeStatus={changeStatus}
              viewBugDetails={viewBugDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            {hasFilters ? (
              <Search size={28} />
            ) : (
              <Smile size={28} />
            )}
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            {hasFilters
              ? "No matching assigned bugs"
              : "You're all caught up!"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            {hasFilters
              ? "No assigned bugs match your current search and filter settings. Try changing your filters."
              : "There are currently no bugs assigned to your account."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Bug details modal */}
      {detailsBug && (
        <BugDetailsModal
          bug={detailsBug}
          onClose={() => setDetailsBug(null)}
        />
      )}
    </div>
  );
};

export default MyBugsPage;
