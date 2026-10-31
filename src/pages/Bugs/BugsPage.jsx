
import { useContext, useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Bug as BugIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

import { BugContext } from "../../context/BugContext";
import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";
import BugCard from "../../components/ui/BugCard";
import CreateBugModal from "../../components/ui/CreateBugModal";
import BugDetailsModal from "../../components/ui/BugDetailsModal";
import { AuthContext } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 9;

const BugsPage = () => {
  const { bugs, setBugs } = useContext(BugContext);
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [detailsBug, setDetailsBug] = useState(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPriority, filterStatus, sortBy]);

  const fetchBugs = async () => {
    setLoading(true);

    try {
      const data = await bugService.getBugs();
      setBugs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch bugs:", getErrorMessage(error));
      toast.error(getErrorMessage(error) || "Failed to load bugs");
    } finally {
      setLoading(false);
    }
  };

  const addBug = async (bugData) => {
    try {
      const createdBug = await bugService.createBug(bugData);
      setBugs((current) => [...current, createdBug]);
      setIsModalOpen(false);
      toast.success("Bug created successfully!");
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Failed to create bug:", msg);
      toast.error(msg || "Failed to create bug");
    }
  };

  const deleteBug = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bug?")) return;

    try {
      await bugService.deleteBug(id);
      setBugs((current) => current.filter((bug) => bug.id !== id));
      toast.success("Bug deleted successfully");
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Failed to delete bug:", msg);
      toast.error(msg || "Failed to delete bug");
    }
  };

  const editBug = (id) => {
    const bugToEdit = bugs.find((bug) => bug.id === id);
    if (!bugToEdit) return;

    setSelectedBug(bugToEdit);
    setIsModalOpen(true);
  };

  const updateBug = async (updatedBug) => {
    try {
      const updated = await bugService.updateBug(updatedBug.id, updatedBug);

      setBugs((current) =>
        current.map((bug) => (bug.id === updatedBug.id ? updated : bug))
      );

      setSelectedBug(null);
      setIsModalOpen(false);
      toast.success("Bug updated successfully");
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Failed to update bug:", msg);
      toast.error(msg || "Failed to update bug");
    }
  };

  const viewBugDetails = (bugId) => {
    const bug = bugs.find((item) => item.id === bugId);
    if (bug) setDetailsBug(bug);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      const bugToUpdate = bugs.find((bug) => bug.id === id);
      if (!bugToUpdate) return;

      const updatedBug = { ...bugToUpdate, status: newStatus };
      const updated = await bugService.updateBug(id, updatedBug);

      setBugs((current) =>
        current.map((bug) => (bug.id === id ? updated : bug))
      );

      toast.success(
        `Status updated to ${newStatus.replace("_", " ").toLowerCase()}`
      );
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Failed to change status:", msg);
      toast.error(msg || "Failed to update status");
    }
  };

  const filteredBugs = useMemo(() => {
    let result = (bugs || []).filter((bug) => {
      if (user?.role === "DEVELOPER") {
        return (
          bug.assignedTo?.email?.toLowerCase() === user.email?.toLowerCase()
        );
      }
      return true;
    });

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (bug) =>
          bug.title?.toLowerCase().includes(query) ||
          bug.description?.toLowerCase().includes(query) ||
          String(bug.id).includes(query) ||
          (typeof bug.project === "object"
            ? bug.project?.name?.toLowerCase().includes(query)
            : bug.project?.toLowerCase().includes(query))
      );
    }

    if (filterPriority !== "All") {
      result = result.filter(
        (bug) => bug.priority?.toUpperCase() === filterPriority.toUpperCase()
      );
    }

    if (filterStatus !== "All") {
      result = result.filter(
        (bug) => bug.status?.toUpperCase() === filterStatus.toUpperCase()
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "oldest") return a.id - b.id;
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortBy === "priority") {
        const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (
          (weights[b.priority?.toUpperCase()] || 0) -
          (weights[a.priority?.toUpperCase()] || 0)
        );
      }

      return 0;
    });

    return result;
  }, [bugs, user, search, filterPriority, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredBugs.length / ITEMS_PER_PAGE) || 1;

  const paginatedBugs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBugs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBugs, currentPage]);

  const counts = useMemo(() => {
    const list =
      user?.role === "DEVELOPER"
        ? bugs.filter(
          (bug) =>
            bug.assignedTo?.email?.toLowerCase() === user.email?.toLowerCase()
        )
        : bugs;

    return {
      total: list.length,
      open: list.filter((bug) => bug.status === "OPEN").length,
      inProgress: list.filter((bug) => bug.status === "IN_PROGRESS").length,
      resolved: list.filter((bug) => bug.status === "RESOLVED").length,
      high: list.filter((bug) => bug.priority === "HIGH").length,
      medium: list.filter((bug) => bug.priority === "MEDIUM").length,
      low: list.filter((bug) => bug.priority === "LOW").length,
    };
  }, [bugs, user]);

  const hasActiveFilters =
    search.trim() !== "" ||
    filterPriority !== "All" ||
    filterStatus !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilterPriority("All");
    setFilterStatus("All");
    setSortBy("newest");
  };

  const metricCards = [
    {
      label: "Total",
      count: counts.total,
      Icon: BugIcon,
      color: "text-blue-600 dark:text-blue-400",
      active: filterStatus === "All",
      onClick: () => setFilterStatus("All"),
    },
    {
      label: "Open",
      count: counts.open,
      Icon: AlertCircle,
      color: "text-sky-600 dark:text-sky-400",
      active: filterStatus === "OPEN",
      onClick: () => setFilterStatus("OPEN"),
    },
    {
      label: "In Progress",
      count: counts.inProgress,
      Icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      active: filterStatus === "IN_PROGRESS",
      onClick: () => setFilterStatus("IN_PROGRESS"),
    },
    {
      label: "Resolved",
      count: counts.resolved,
      Icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      active: filterStatus === "RESOLVED",
      onClick: () => setFilterStatus("RESOLVED"),
    },
  ];

  const priorityFilters = [
    { id: "All", label: "All" },
    { id: "High", label: "High", count: counts.high },
    { id: "Medium", label: "Medium", count: counts.medium },
    { id: "Low", label: "Low", count: counts.low },
  ];

  const statusFilters = [
    { id: "All", label: "All" },
    { id: "OPEN", label: "Open" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "RESOLVED", label: "Resolved" },
  ];

  const filterButtonClass = (active) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${active
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="space-y-6 bg-transparent text-slate-900 dark:text-slate-100">
      {/* Page header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Bugs Management
            </h1>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              {filteredBugs.length}{" "}
              {filteredBugs.length === 1 ? "issue" : "issues"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Track, prioritize, and resolve software defects across all projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBugs}
            disabled={loading}
            title="Refresh bugs"
            aria-label="Refresh bugs"
            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin text-blue-500" : ""}
            />
          </button>

          {(user?.role === "ADMIN" || user?.role === "TESTER") && (
            <button
              type="button"
              onClick={() => {
                setSelectedBug(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Bug
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metricCards.map(({ label, count, Icon, color, active, onClick }) => (
          <button
            type="button"
            key={label}
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${active
                ? "border-blue-400 ring-1 ring-blue-200 dark:border-blue-500 dark:ring-blue-500/20"
                : "border-slate-200 dark:border-slate-700"
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {label}
              </span>
              <Icon size={17} className={color} />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {count}
            </p>
          </button>
        ))}
      </div>

      {/* Search and filter panel */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />

            <input
              type="text"
              aria-label="Search bugs"
              placeholder="Search by bug title, description, project, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
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

          <div className="relative w-full md:w-56 md:shrink-0">
            <ArrowUpDown
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />

            <select
              aria-label="Sort bugs"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 py-3 pl-9 pr-8 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority: High to Low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <X size={13} />
              Reset
            </button>
          )}
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Filter size={13} />
              Priority
            </span>

            {priorityFilters.map((item) => {
              const active = filterPriority === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFilterPriority(item.id)}
                  aria-pressed={active}
                  className={filterButtonClass(active)}
                >
                  {item.label}

                  {item.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${active
                          ? "bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Status
            </span>

            {statusFilters.map((item) => {
              const active = filterStatus === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFilterStatus(item.id)}
                  aria-pressed={active}
                  className={filterButtonClass(active)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bug cards */}
      {filteredBugs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedBugs.map((bug) => (
              <BugCard
                key={bug.id}
                id={bug.id}
                title={bug.title}
                description={bug.description}
                priority={bug.priority}
                status={bug.status}
                assignedTo={bug.assignedTo}
                project={bug.project}
                deleteBug={deleteBug}
                editBug={editBug}
                changeStatus={changeStatus}
                viewBugDetails={viewBugDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredBugs.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {filteredBugs.length}
                </span>{" "}
                bugs
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const active = currentPage === pageNumber;

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      aria-current={active ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-lg border px-2 text-xs font-semibold transition ${active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            <BugIcon size={28} />
          </div>

          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            No bugs found
          </h3>

          <p className="mx-auto mb-6 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {hasActiveFilters
              ? "No bugs match your current filters. Try clearing filters or adjusting your search."
              : "No bugs have been registered in the system yet."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Create / edit modal */}
      <CreateBugModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBug(null);
        }}
        addBug={addBug}
        updateBug={updateBug}
        selectedBug={selectedBug}
      />

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

export default BugsPage;
