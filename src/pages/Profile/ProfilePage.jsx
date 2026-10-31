
import { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Bug,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  RefreshCw,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import bugService from "../../services/bugService";
import { getErrorMessage } from "../../utils/errorHandler";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  const [assignedBugs, setAssignedBugs] = useState([]);
  const [loadingBugs, setLoadingBugs] = useState(true);

  // Fetch assigned bugs for the current user.
  useEffect(() => {
    let isMounted = true;

    const fetchUserBugs = async () => {
      if (!user?.email) {
        setAssignedBugs([]);
        setLoadingBugs(false);
        return;
      }

      setLoadingBugs(true);

      try {
        const data = await bugService.getBugs();
        const bugs = Array.isArray(data) ? data : [];

        const userBugs = bugs.filter(
          (bug) =>
            bug.assignedTo?.email?.toLowerCase() ===
            user.email.toLowerCase()
        );

        if (isMounted) {
          setAssignedBugs(userBugs);
        }
      } catch (error) {
        console.error(
          "Fetch profile metrics error:",
          getErrorMessage(error)
        );
      } finally {
        if (isMounted) {
          setLoadingBugs(false);
        }
      }
    };

    fetchUserBugs();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const stats = useMemo(
    () => ({
      total: assignedBugs.length,
      open: assignedBugs.filter((bug) => bug.status === "OPEN").length,
      inProgress: assignedBugs.filter(
        (bug) => bug.status === "IN_PROGRESS"
      ).length,
      resolved: assignedBugs.filter(
        (bug) => bug.status === "RESOLVED"
      ).length,
    }),
    [assignedBugs]
  );

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30",
          label: "System Administrator",
          description:
            "Full access to user management, projects, bug lifecycle, and system configuration.",
        };

      case "DEVELOPER":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
          label: "Software Developer",
          description:
            "Assigned defect workflow transitions, code resolutions, and defect commenting.",
        };

      case "TESTER":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
          label: "QA Test Engineer",
          description:
            "Defect discovery, bug logging, screenshot reproduction attachments, and verification.",
        };

      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          label: role || "Team Member",
          description: "Standard platform access privileges.",
        };
    }
  };

  const roleStyle = getRoleBadge(user?.role);

  const workloadCards = [
    {
      label: "Total Assigned",
      value: stats.total,
      icon: Bug,
      color: "indigo",
    },
    {
      label: "Open (To Do)",
      value: stats.open,
      icon: AlertCircle,
      color: "sky",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "amber",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "emerald",
    },
  ];

  const metricColors = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    sky: "text-sky-600 dark:text-sky-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };

  const surface =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

  const attributeCard =
    "rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60";

  const attributeLabel =
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  const attributeValue =
    "break-words text-sm font-semibold text-slate-800 dark:text-slate-200";

  return (
    <div className="mx-auto min-h-full max-w-5xl space-y-6 bg-slate-50 p-4 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:p-6">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <User size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              My Account Profile
            </h1>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Your identity, account permissions, and assigned workload.
            </p>
          </div>
        </div>
      </div>

      {/* Main profile card */}
      <section className={`${surface} overflow-hidden`}>
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400" />

        <div className="p-5 sm:p-8">
          {/* User identity */}
          <div className="flex flex-col items-center gap-5 border-b border-slate-200 pb-7 dark:border-slate-800 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 text-4xl font-bold text-white shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-slate-800">
              {initial}
            </div>

            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap">
                <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {user?.name || "Anonymous User"}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${roleStyle.bg}`}
                >
                  <Shield size={14} />
                  {roleStyle.label}
                </span>
              </div>

              <p className="flex items-center justify-center gap-2 break-all text-sm text-slate-600 dark:text-slate-400 sm:justify-start">
                <Mail
                  size={16}
                  className="shrink-0 text-indigo-600 dark:text-indigo-400"
                />
                {user?.email || "No email address registered"}
              </p>

              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {roleStyle.description}
              </p>
            </div>
          </div>

          {/* Account attributes */}
          <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            <div className={attributeCard}>
              <span className={attributeLabel}>Full Name</span>
              <p className={attributeValue}>{user?.name || "—"}</p>
            </div>

            <div className={attributeCard}>
              <span className={attributeLabel}>Registered Email</span>
              <p className={`${attributeValue} break-all`}>
                {user?.email || "—"}
              </p>
            </div>

            <div className={attributeCard}>
              <span className={attributeLabel}>System Identifier</span>
              <p className={`${attributeValue} font-mono`}>
                USER-#{user?.id ?? "N/A"}
              </p>
            </div>

            <div className={attributeCard}>
              <span className={attributeLabel}>Authentication Status</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck size={17} />
                Active JWT Bearer Session
              </span>
            </div>
          </div>

          {/* Account management notice */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Lock size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Directory-Managed Profile
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Account identity details and access roles are managed
                according to organizational policies. Contact your system
                administrator to request account changes.
              </p>

              {user?.role?.toUpperCase() === "ADMIN" && (
                <Link
                  to="/users"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                >
                  Users Directory
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Workload summary */}
      <section className={`${surface} p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Bug size={21} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assigned Workload
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Bug statistics assigned to your account.
              </p>
            </div>
          </div>

          <Link
            to="/my-bugs"
            className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
          >
            View My Bugs
            <ExternalLink size={14} />
          </Link>
        </div>

        {loadingBugs ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-600 dark:text-slate-400">
            <RefreshCw
              size={19}
              className="animate-spin text-indigo-600 dark:text-indigo-400"
            />
            Loading workload statistics...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {workloadCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium leading-5 text-slate-600 dark:text-slate-400">
                      {card.label}
                    </span>

                    <Icon
                      size={18}
                      className={`shrink-0 ${metricColors[card.color]}`}
                    />
                  </div>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
