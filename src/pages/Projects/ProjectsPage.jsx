
import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Folder,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  ArrowRight,
  Layers,
  Loader2,
  RefreshCw,
} from "lucide-react";

import projectService from "../../services/projectService";
import { getErrorMessage } from "../../utils/errorHandler";
import { AuthContext } from "../../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Project Fetch Error:", getErrorMessage(error));
      toast.error(getErrorMessage(error) || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setName("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setName(project.name || "");
    setDescription(project.description || "");
    setIsModalOpen(true);
  };

  const createProject = async () => {
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await projectService.createProject({
        name: name.trim(),
        description: description.trim(),
      });

      setProjects((previous) => [...previous, created]);
      setName("");
      setDescription("");
      setIsModalOpen(false);
      toast.success("Project created successfully");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Create Project Error:", message);
      toast.error(message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProject = async () => {
    if (!name.trim() || !selectedProject || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await projectService.updateProject(
        selectedProject.id,
        {
          name: name.trim(),
          description: description.trim(),
        }
      );

      setProjects((previous) =>
        previous.map((project) =>
          project.id === selectedProject.id ? updated : project
        )
      );

      setSelectedProject(null);
      setName("");
      setDescription("");
      setIsModalOpen(false);
      toast.success("Project updated successfully");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Update Project Error:", message);
      toast.error(message || "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (id, projectName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${projectName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await projectService.deleteProject(id);
      setProjects((previous) =>
        previous.filter((project) => project.id !== id)
      );
      toast.success("Project deleted successfully");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Delete Project Error:", message);
      toast.error(message || "Failed to delete project");
    }
  };

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    const query = search.toLowerCase();

    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.id?.toString().includes(query)
    );
  }, [projects, search]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Page heading */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Projects Directory
            </h1>

            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Organize work, manage project workspaces, and monitor software
            quality across repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProjects}
            disabled={loading}
            title="Refresh projects"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin text-indigo-500" : ""}
            />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <Plus size={18} />
              Create Project
            </button>
          )}
        </div>
      </div>

      {/* Search toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full max-w-lg">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search projects by name, description, or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-20 text-slate-500 dark:text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        /* Project cards */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:hover:bg-slate-900/80"
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <Folder size={17} />
                    </div>

                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      PRJ-{project.id}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        title="Edit project"
                        aria-label={`Edit ${project.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 dark:text-slate-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProject(project.id, project.name)
                        }
                        title="Delete project"
                        aria-label={`Delete ${project.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <h3
                  onClick={() => navigate(`/projects/${project.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(`/projects/${project.id}`);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  title={project.name}
                  className="cursor-pointer break-words text-lg font-bold leading-snug text-slate-900 transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 dark:hover:text-indigo-300"
                >
                  {project.name}
                </h3>

                <p className="mt-2 min-h-12 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {project.description || (
                    <span className="italic text-slate-400 dark:text-slate-500">
                      No project description provided.
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  ID: #{project.id}
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Layers size={28} />
          </div>

          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            {search ? "No projects match your search" : "No projects registered"}
          </h3>

          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {search
              ? `No project matches "${search}". Try another search term.`
              : "Create a project workspace to begin tracking defects and collaborating with developers."}
          </p>

          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
            >
              Clear Search
            </button>
          ) : (
            isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Create First Project
              </button>
            )
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Folder size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedProject
                      ? `Edit Project: ${selectedProject.name}`
                      : "Create New Project"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {selectedProject
                      ? "Update the project name and description."
                      : "Create a workspace for tracking project defects."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (selectedProject) updateProject();
                else createProject();
              }}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Project Name <span className="text-rose-500">*</span>
                </label>

                <input
                  id="project-name"
                  type="text"
                  placeholder="e.g. Customer Portal App"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Project Description
                </label>

                <textarea
                  id="project-description"
                  placeholder="Describe the project scope, repository, or objectives..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedProject ? "Update Project" : "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
