
import {
  LayoutDashboard,
  Bug,
  FolderKanban,
  Settings,
  Users,
  User,
  LogOut,
  FolderDot,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({
  sidebarOpen = false,
  setSidebarOpen = () => { },
}) => {
  const { user, logout } = useContext(AuthContext);

  const navClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-xl border px-3.5 py-2.5",
      "text-sm font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      isActive
        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 dark:hover:text-white",
    ].join(" ");

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400";
      case "DEVELOPER":
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
      case "TESTER":
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  const linkIconClass = "shrink-0 transition-transform duration-200 group-hover:scale-105";

  const renderLink = (to, Icon, label, extraClass = "") => (
    <NavLink
      to={to}
      className={navClass}
      onClick={closeSidebar}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={`${linkIconClass} ${isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400"
              } ${extraClass}`}
          />
          <span className="truncate">{label}</span>
          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col",
          "border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d121f]",
          "transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl shadow-md shadow-blue-500/20">
              🐞
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  BugTracker
                </h1>
                <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                  PRO
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Agile QA Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {/* Workspace */}
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Workspace
            </p>

            <div className="space-y-1">
              {renderLink("/", LayoutDashboard, "Dashboard")}
              {renderLink("/kanban", FolderKanban, "Kanban Board")}
              {renderLink("/bugs", Bug, "All Bugs")}

              {user?.role === "DEVELOPER" &&
                renderLink("/my-bugs", Bug, "My Assigned Bugs")}
            </div>
          </div>

          {/* Admin management */}
          {user?.role === "ADMIN" && (
            <div>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Management
              </p>

              <div className="space-y-1">
                {renderLink("/projects", FolderDot, "Projects")}
                {renderLink("/users", Users, "User Directory")}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Preferences
            </p>

            <div className="space-y-1">
              {renderLink("/profile", User, "My Profile")}
              {renderLink("/settings", Settings, "Settings")}
            </div>
          </div>
        </nav>

        {/* Logged-in user */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold uppercase text-white shadow-sm">
                {user?.name?.trim()?.charAt(0) || "U"}
              </div>

              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-50 bg-emerald-500 dark:border-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || "User"}
              </p>

              <span
                className={`mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${getRoleBadgeColor(
                  user?.role
                )}`}
              >
                {user?.role || "GUEST"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <LogOut size={17} />
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-600">
            BugTracker · Issue Management
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
