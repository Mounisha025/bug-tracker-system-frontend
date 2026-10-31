
import { useState, useEffect } from "react";
import {
  X,
  Bug,
  Upload,
  Image as ImageIcon,
  Loader2,
  Folder,
  User,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import userService from "../../services/userService";
import projectService from "../../services/projectService";
import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";
import { UPLOADS_BASE_URL } from "../../api/axios";

const CreateBugModal = ({
  isOpen,
  onClose,
  addBug,
  updateBug,
  selectedBug,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [status, setStatus] = useState("OPEN");
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Lock page scrolling and support Escape to close.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Load users and projects when the modal opens.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoadingData(true);

      try {
        const [usersData, projectsData] = await Promise.all([
          userService.getUsers(),
          projectService.getProjects(),
        ]);

        if (!cancelled) {
          setUsers(Array.isArray(usersData) ? usersData : []);
          setProjects(Array.isArray(projectsData) ? projectsData : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Load users/projects error:",
            getErrorMessage(error)
          );
          toast.error("Failed to load users or projects");
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Prefill the form when editing; reset it when creating.
  useEffect(() => {
    if (selectedBug) {
      setTitle(selectedBug.title || "");
      setDescription(selectedBug.description || "");
      setPriority(selectedBug.priority || "LOW");
      setStatus(selectedBug.status || "OPEN");

      setAssignedTo(
        selectedBug.assignedTo?.id != null
          ? String(selectedBug.assignedTo.id)
          : ""
      );

      setProjectId(
        selectedBug.project?.id != null
          ? String(selectedBug.project.id)
          : ""
      );

      if (selectedBug.screenshot) {
        setScreenshot(selectedBug.screenshot);
        setPreviewUrl(
          `${UPLOADS_BASE_URL}/${selectedBug.screenshot}`
        );
      } else {
        setScreenshot(null);
        setPreviewUrl(null);
      }
    } else {
      resetForm();
    }
  }, [selectedBug, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("LOW");
    setStatus("OPEN");
    setAssignedTo("");
    setProjectId("");
    setScreenshot(null);
    setPreviewUrl(null);
  };

  // Select a screenshot.
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less");
      event.target.value = "";
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveScreenshot = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setScreenshot(null);
    setPreviewUrl(null);
  };

  // Clean up temporary image previews.
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Create or update the bug using the existing service callbacks.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    let screenshotName = "";

    try {
      if (screenshot instanceof File) {
        try {
          screenshotName = await bugService.uploadScreenshot(screenshot);
        } catch (error) {
          console.error(
            "Upload Screenshot Error:",
            getErrorMessage(error)
          );
          toast.error(
            "Screenshot upload failed. Saving bug details without it."
          );
        }
      } else if (typeof screenshot === "string") {
        // Preserve an existing attachment if it was not changed.
        screenshotName = screenshot;
      }

      const bugData = {
        title: title.trim(),
        description: description.trim(),
        screenshot: screenshotName,
        priority,
        status,
        assignedTo: assignedTo
          ? { id: Number(assignedTo) }
          : null,
        project: projectId
          ? { id: Number(projectId) }
          : null,
      };

      if (selectedBug) {
        await updateBug({
          ...selectedBug,
          ...bugData,
        });
      } else {
        await addBug(bugData);
      }

      resetForm();
    } catch (error) {
      console.error("Submit bug error:", getErrorMessage(error));
      toast.error(
        getErrorMessage(error) || "Failed to save bug"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20";

  const labelClass =
    "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm dark:bg-black/75 sm:p-6"
      onClick={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-bug-title"
        className="flex max-h-[95vh] w-full max-w-2xl animate-in fade-in zoom-in-95 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[92vh]"
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Bug size={20} />
            </div>

            <div className="min-w-0">
              <h2
                id="create-bug-title"
                className="text-base font-bold text-slate-900 dark:text-white sm:text-lg"
              >
                {selectedBug
                  ? `Edit Bug #BUG-${selectedBug.id}`
                  : "Create New Bug"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {selectedBug
                  ? "Update bug details and workflow status."
                  : "Enter the details needed to report a defect."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          id="create-bug-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6"
        >
          {/* Title */}
          <div>
            <label htmlFor="bug-title" className={labelClass}>
              Bug Title <span className="text-rose-500">*</span>
            </label>

            <input
              id="bug-title"
              type="text"
              placeholder="e.g. Navigation dropdown closes unexpectedly"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
              required
              maxLength={255}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="bug-description" className={labelClass}>
              Description &amp; Reproduction Steps
            </label>

            <textarea
              id="bug-description"
              placeholder="Describe the bug, steps to reproduce it, and expected behavior..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className={`${inputClass} resize-y leading-6`}
            />
          </div>

          {/* Priority and status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bug-priority" className={labelClass}>
                Priority
              </label>

              <select
                id="bug-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className={inputClass}
              >
                <option value="LOW">Low — Minor issue</option>
                <option value="MEDIUM">Medium — Normal priority</option>
                <option value="HIGH">High — Critical blocker</option>
              </select>
            </div>

            <div>
              <label htmlFor="bug-status" className={labelClass}>
                Status
              </label>

              <select
                id="bug-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                <option value="OPEN">Open (To Do)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved (Done)</option>
              </select>
            </div>
          </div>

          {/* Project and assignee */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bug-project" className={labelClass}>
                <Folder
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Project
              </label>

              <select
                id="bug-project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className={inputClass}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Loading projects..." : "Select Project"}
                </option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bug-assignee" className={labelClass}>
                <User
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Assignee
              </label>

              <select
                id="bug-assignee"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className={inputClass}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Loading users..." : "Unassigned"}
                </option>

                {users.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className={labelClass}>
              <ImageIcon
                size={14}
                className="text-indigo-600 dark:text-indigo-400"
              />
              Screenshot or Attachment
            </label>

            {previewUrl ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {screenshot instanceof File
                        ? screenshot.name
                        : "Attached Screenshot"}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <Check size={13} />
                      Image attached
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition group-hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:text-indigo-400">
                  <Upload size={21} />
                </div>

                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to upload screenshot
                </span>

                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PNG, JPG, GIF, or another image format · Max 10 MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-bug-form"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                {selectedBug ? "Update Issue" : "Create Issue"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBugModal;
