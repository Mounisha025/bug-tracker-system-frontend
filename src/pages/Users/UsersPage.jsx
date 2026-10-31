
import { useEffect, useState, useContext, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Plus,
  X,
  Trash2,
  Shield,
  Code,
  CheckCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Filter,
} from "lucide-react";

import userService from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";
import { AuthContext } from "../../context/AuthContext";

const EMPTY_USER = {
  name: "",
  email: "",
  password: "",
  role: "DEVELOPER",
};

const UsersPage = () => {
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ ...EMPTY_USER });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Fetch Users Error:", message);
      toast.error(message || "Failed to load users directory");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (
      !newUser.name.trim() ||
      !newUser.email.trim() ||
      !newUser.password
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (creating) return;

    setCreating(true);

    try {
      await userService.createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      toast.success("User created successfully!");
      setShowAddUser(false);
      setNewUser({ ...EMPTY_USER });
      await fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Create User Error:", message);
      toast.error(message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const closeAddUser = () => {
    if (creating) return;
    setShowAddUser(false);
    setNewUser({ ...EMPTY_USER });
  };

  const deleteUser = async (id, userName) => {
    if (currentUser?.id === id) {
      toast.error("You cannot delete your own active administrator account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${userName}"?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await userService.deleteUser(id);
      setUsers((previousUsers) =>
        previousUsers.filter((item) => item.id !== id)
      );
      toast.success(`User "${userName}" was removed successfully`);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Delete User Error:", error);
      toast.error(message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((item) => item.role === "ADMIN").length,
      developer: users.filter((item) => item.role === "DEVELOPER").length,
      tester: users.filter((item) => item.role === "TESTER").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((item) => {
        if (!search.trim()) return true;

        const query = search.toLowerCase();

        return (
          item.name?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.id?.toString().includes(query)
        );
      })
      .filter(
        (item) => roleFilter === "ALL" || item.role === roleFilter
      );
  }, [users, search, roleFilter]);

  const hasFilters = search.trim() !== "" || roleFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
  };

  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return {
          classes:
            "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
          icon: <Shield size={13} />,
          label: "Admin",
        };

      case "DEVELOPER":
        return {
          classes:
            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
          icon: <Code size={13} />,
          label: "Developer",
        };

      case "TESTER":
        return {
          classes:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
          icon: <CheckCircle size={13} />,
          label: "QA Tester",
        };

      default:
        return {
          classes:
            "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: <User size={13} />,
          label: role || "Member",
        };
    }
  };

  const panel =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20";

  const metrics = [
    {
      id: "ALL",
      label: "Total Members",
      count: counts.total,
      icon: <Users size={17} />,
      color: "text-indigo-600 dark:text-indigo-300",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      id: "ADMIN",
      label: "Administrators",
      count: counts.admin,
      icon: <Shield size={17} />,
      color: "text-purple-600 dark:text-purple-300",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      id: "DEVELOPER",
      label: "Developers",
      count: counts.developer,
      icon: <Code size={17} />,
      color: "text-sky-600 dark:text-sky-300",
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
    },
    {
      id: "TESTER",
      label: "QA Testers",
      count: counts.tester,
      icon: <CheckCircle size={17} />,
      color: "text-emerald-600 dark:text-emerald-300",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Page heading */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              User Management
            </h1>

            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Manage team members, role assignments, and workspace access
            privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            <Plus size={17} />
            Add User
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh user directory"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin text-indigo-500" : ""}
            />
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metrics.map((metric) => (
          <button
            type="button"
            key={metric.id}
            onClick={() => setRoleFilter(metric.id)}
            aria-pressed={roleFilter === metric.id}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${roleFilter === metric.id
              ? "border-indigo-400 ring-2 ring-indigo-100 dark:border-indigo-500 dark:ring-indigo-500/20"
              : "border-slate-200 dark:border-slate-800"
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium leading-snug text-slate-600 dark:text-slate-400">
                {metric.label}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${metric.iconBg} ${metric.color}`}
              >
                {metric.icon}
              </span>
            </div>

            <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {metric.count}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {roleFilter === metric.id ? "Currently selected" : "View members"}
            </p>
          </button>
        ))}
      </div>

      {/* Search and role filters */}
      <section className={`${panel} flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="relative w-full lg:max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${inputStyle} pl-10 pr-10`}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Filter size={15} />
            Role:
          </span>

          {[
            { id: "ALL", label: "All" },
            { id: "ADMIN", label: "Admin" },
            { id: "DEVELOPER", label: "Developer" },
            { id: "TESTER", label: "Tester" },
          ].map((role) => (
            <button
              type="button"
              key={role.id}
              onClick={() => setRoleFilter(role.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${roleFilter === role.id
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
                }`}
            >
              {role.label}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <X size={13} />
              Reset
            </button>
          )}
        </div>
      </section>

      {/* User directory */}
      <section className={`${panel} overflow-hidden p-4 sm:p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Team Directory
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              View team accounts and their assigned roles.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {filteredUsers.length} results
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-20 text-slate-500 dark:text-slate-400">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading members directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">Role &amp; Access</th>
                  <th className="px-4 py-3.5">User ID</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filteredUsers.map((item) => {
                  const roleStyle = getRoleBadge(item.role);
                  const initial = item.name
                    ? item.name.charAt(0).toUpperCase()
                    : "U";
                  const isCurrent =
                    String(currentUser?.id) === String(item.id);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                            {initial}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.name || "Unnamed User"}
                            </span>

                            {isCurrent && (
                              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                        {item.email}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyle.classes}`}
                        >
                          {roleStyle.icon}
                          {roleStyle.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        #{item.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteUser(item.id, item.name)}
                          disabled={isCurrent || deletingId === item.id}
                          title={
                            isCurrent
                              ? "Cannot delete your own active account"
                              : "Delete user"
                          }
                          aria-label={`Delete user ${item.name}`}
                          className="inline-flex rounded-lg border border-transparent p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        >
                          {deletingId === item.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-rose-500"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <AlertCircle size={25} />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {hasFilters ? "No members match the criteria" : "No users found"}
            </h3>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {hasFilters
                ? "Try changing your search or role filter."
                : "No users are registered in the database yet."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Add User modal */}
      {showAddUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddUser();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Users size={20} />
                </div>

                <h2
                  id="add-user-title"
                  className="text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  Add New User
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Create a user account for your team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddUser}
                disabled={creating}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="new-user-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser({ ...newUser, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  autoComplete="name"
                  disabled={creating}
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="new-user-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({ ...newUser, email: event.target.value })
                  }
                  placeholder="user@example.com"
                  required
                  autoComplete="email"
                  disabled={creating}
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="new-user-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Temporary Password
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({ ...newUser, password: event.target.value })
                  }
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={creating}
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="new-user-role"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  User Role
                </label>
                <select
                  id="new-user-role"
                  value={newUser.role}
                  onChange={(event) =>
                    setNewUser({ ...newUser, role: event.target.value })
                  }
                  disabled={creating}
                  className={inputStyle}
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="TESTER">Tester</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddUser}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create User
                    </>
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

export default UsersPage;
