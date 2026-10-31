
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  CheckCheck,
  X,
} from "lucide-react";

import {
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar = ({ setSidebarOpen = () => { } }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  const {
    notifications = [],
    unreadCount = 0,
    fetchNotifications,
    markAllAsRead,
  } = useContext(NotificationContext);

  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
        setOpenNotifications(false);
      }
    };

    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setOpenMenu(false);
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/" || path === "") return "Dashboard";
    if (path.startsWith("/bugs")) return "Bugs Management";
    if (path.startsWith("/kanban")) return "Kanban Board";
    if (path.startsWith("/my-bugs")) return "My Assigned Bugs";
    if (path.startsWith("/projects/")) return "Project Details";
    if (path.startsWith("/projects")) return "Projects Directory";
    if (path.startsWith("/users")) return "User Management";
    if (path.startsWith("/profile")) return "My Profile";
    if (path.startsWith("/settings")) return "Settings";

    return "Dashboard";
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/bugs?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  const handleLogout = () => {
    setOpenMenu(false);
    setOpenNotifications(false);
    logout();
  };

  const formatNotificationDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-[#0d121f]/95 sm:px-5 lg:px-6">
      {/* Page title and mobile navigation */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {getPageTitle()}
          </h1>

          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            Welcome back,{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {user?.name || "User"}
            </span>
          </p>
        </div>
      </div>

      {/* Search, theme, notifications and profile */}
      <div ref={menuRef} className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900/70 md:flex"
        >
          <Search
            size={16}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />

          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search bugs..."
            aria-label="Search bugs"
            className="ml-2.5 w-28 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500 lg:w-40"
          />

          <kbd className="ml-2 hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 lg:inline-block">
            Ctrl K
          </kbd>
        </form>

        {/* Theme toggle */}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const shouldOpen = !openNotifications;

              setOpenNotifications(shouldOpen);
              setOpenMenu(false);

              if (shouldOpen) {
                fetchNotifications?.();
              }
            }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={openNotifications}
            className="relative rounded-xl border border-transparent p-2 text-slate-600 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0d121f]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOpenNotifications(false)}
                  aria-label="Close notifications"
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              {notifications.length > 0 && (
                <div className="flex justify-end border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                </div>
              )}

              <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Bell size={20} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No notifications yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${!notification.read
                          ? "bg-blue-50/60 dark:bg-blue-950/20"
                          : ""
                        }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!notification.read
                            ? "bg-blue-500"
                            : "bg-slate-300 dark:bg-slate-700"
                          }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenMenu(!openMenu);
              setOpenNotifications(false);
            }}
            aria-label="Open user menu"
            aria-expanded={openMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold uppercase text-white shadow-sm ring-2 ring-blue-500/15 transition hover:ring-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {user?.name?.trim()?.charAt(0) || "U"}
          </button>

          {openMenu && (
            <div className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </p>
                {user?.role && (
                  <span className="mt-2 inline-block rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                    {user.role}
                  </span>
                )}
              </div>

              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setOpenMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  <UserIcon size={16} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/settings");
                    setOpenMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  <SettingsIcon size={16} />
                  Settings
                </button>

                <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
