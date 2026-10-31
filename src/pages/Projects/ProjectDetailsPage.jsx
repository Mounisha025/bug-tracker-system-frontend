
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Folder,
  Bug,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  X,
  Eye,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";

import projectService from "../../services/projectService";
import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";
import StatCard from "../../components/cards/StatCard";
import BugDetailsModal from "../../components/ui/BugDetailsModal";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("TITLE");
  const [detailsBug, setDetailsBug] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [projectData, allBugs] = await Promise.all([
        projectService.getProjectById(id),
        bugService.getBugs(),
      ]);

      setProject(projectData);

      const projectBugs = (Array.isArray(allBugs) ? allBugs : []).filter(
        (bug) => Number(bug.project?.id) === Number(id)
      );

      setBugs(projectBugs);
    } catch (error) {
      console.error(
        "Fetch Project Details Error:",
        getErrorMessage(error)
      );
      toast.error(
        getErrorMessage(error) || "Failed to load project details"
      );
    } finally {
      setLoading(false);
    }
  };

  const openBugs = useMemo(
    () => bugs.filter((bug) => bug.status === "OPEN").length,
    [bugs]
  );

  const progressBugs = useMemo(
    () => bugs.filter((bug) => bug.status === "IN_PROGRESS").length,
    [bugs]
  );

  const resolvedBugs = useMemo(
    () => bugs.filter((bug) => bug.status === "RESOLVED").length,
    [bugs]
  );

  const progress =
    bugs.length === 0
      ? 0
      : Math.round((resolvedBugs / bugs.length) * 100);

  const teamMembers = useMemo(() => {
    const members = new Map();

    bugs.filter((bug) => bug.assignedTo).forEach((bug) => {
      const member = bug.assignedTo;

      if (typeof member === "object" && member.id != null) {
        if (!members.has(member.id)) {
          members.set(member.id, member);
        }
      }
    });

    return Array.from(members.values());
  }, [bugs]);

  const filteredBugs = useMemo(() => {
    return bugs
      .filter((bug) => {
        if (!search.trim()) return true;

        const query = search.toLowerCase();

        return (
          bug.title?.toLowerCase().includes(query) ||
          bug.description?.toLowerCase().includes(query) ||
          bug.id?.toString().includes(query)
        );
      })
      .filter(
        (bug) =>
          statusFilter === "ALL" ||
          bug.status?.toUpperCase() === statusFilter
      )
      .filter(
        (bug) =>
          priorityFilter === "ALL" ||
          bug.priority?.toUpperCase() === priorityFilter
      )
      .sort((a, b) => {
        if (sortBy === "TITLE") {
          return (a.title || "").localeCompare(b.title || "");
        }

        if (sortBy === "PRIORITY") {
          const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (
            (priorityOrder[a.priority?.toUpperCase()] || 99) -
            (priorityOrder[b.priority?.toUpperCase()] || 99)
          );
        }

        if (sortBy === "STATUS") {
          return (a.status || "").localeCompare(b.status || "");
        }

        return 0;
      });
  }, [bugs, search, statusFilter, priorityFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSortBy("TITLE");
  };

  const getPriorityBadge = (priority) => {
    switch ((priority || "LOW").toUpperCase()) {
      case "HIGH":
        return {
          classes:
            "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
          dot: "bg-rose-500",
          label: "High",
        };

      case "MEDIUM":
        return {
          classes:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
          dot: "bg-amber-500",
          label: "Medium",
        };

      default:
        return {
          classes:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          dot: "bg-emerald-500",
          label: "Low",
        };
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || "OPEN").toUpperCase()) {
      case "IN_PROGRESS":
        return {
          classes:
            "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
          label: "In Progress",
        };

      case "RESOLVED":
        return {
          classes:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          label: "Resolved",
        };

      default:
        return {
          classes:
            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
          label: "Open",
        };
    }
  };

  const panel =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

  const inputStyle =
    "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-24 text-slate-500 dark:text-slate-400">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">
          Loading project workspace...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`${panel} mx-auto mt-10 max-w-lg p-10 text-center`}>
        <AlertCircle
          size={36}
          className="mx-auto mb-3 text-rose-500"
        />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Project Not Found
        </h2>
        <p className="mb-5 mt-2 text-sm text-slate-600 dark:text-slate-400">
          The requested project workspace does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Navigation and project header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="group mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Projects Directory
        </button>

        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Folder size={21} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {project.name}
                </h1>

                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  PRJ-{project.id}
                </span>
              </div>

              <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {project.description || "No project description provided."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            title="Refresh project data"
            className="inline-flex shrink-0 items-center justify-center self-start rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* Resolution progress */}
      <section className={`${panel} p-5`}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
              Resolution Progress
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {resolvedBugs} of {bugs.length} defects resolved
            </p>
          </div>

          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {progress}% Completed
          </span>
        </div>

        <div
          className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-950"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Project resolution progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bugs"
          value={bugs.length}
          category="All Issues"
          icon={<Bug size={20} />}
        />
        <StatCard
          title="Open Bugs"
          value={openBugs}
          category="Pending"
          icon={<AlertCircle size={20} />}
        />
        <StatCard
          title="In Progress"
          value={progressBugs}
          category="Active"
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Resolved"
          value={resolvedBugs}
          category="Completed"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* Project defects */}
      <section className={`${panel} space-y-4 p-4 sm:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Project Defects
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              All reported bugs linked to {project.name}.
            </p>
          </div>

          <span className="self-start rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            {filteredBugs.length}{" "}
            {filteredBugs.length === 1 ? "bug" : "bugs"}
          </span>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bugs by title, description, or ID..."
              className={`w-full pl-10 pr-10 ${inputStyle}`}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              aria-label="Sort bugs"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={inputStyle}
            >
              <option value="TITLE">Sort by Title</option>
              <option value="PRIORITY">Sort by Priority</option>
              <option value="STATUS">Sort by Status</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
              >
                <X size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bugs table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {filteredBugs.length > 0 ? (
                filteredBugs.map((bug) => {
                  const priorityStyle = getPriorityBadge(bug.priority);
                  const statusStyle = getStatusBadge(bug.status);

                  const assigneeName =
                    typeof bug.assignedTo === "object"
                      ? bug.assignedTo?.name
                      : bug.assignedTo;

                  const initial = assigneeName
                    ? assigneeName.charAt(0).toUpperCase()
                    : null;

                  return (
                    <tr
                      key={bug.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      onClick={() => setDetailsBug(bug)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                        BUG-{bug.id}
                      </td>

                      <td className="max-w-xs truncate px-4 py-3 font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-300">
                        {bug.title}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.classes}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}
                          />
                          {priorityStyle.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.classes}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                            {initial || <User size={13} />}
                          </div>

                          <span className="text-slate-700 dark:text-slate-300">
                            {assigneeName || "Unassigned"}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDetailsBug(bug);
                          }}
                          aria-label={`View BUG-${bug.id} details`}
                          title="View bug details"
                          className="inline-flex rounded-lg border border-transparent p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-400 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {hasActiveFilters
                      ? "No defects match the selected filters."
                      : "No defects have been logged in this project yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Team members */}
      <section className={`${panel} p-4 sm:p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Users size={18} />
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Team Members
            </h2>
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {teamMembers.length}{" "}
            {teamMembers.length === 1 ? "member" : "members"} assigned
          </span>
        </div>

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => {
              const initial = member.name
                ? member.name.charAt(0).toUpperCase()
                : "U";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-indigo-500/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {member.name || "Unnamed Member"}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {member.role || "Member"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
            <Users
              size={24}
              className="mx-auto mb-2 text-slate-400"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No team members are currently assigned to defects in this
              project.
            </p>
          </div>
        )}
      </section>

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

export default ProjectDetailsPage;
