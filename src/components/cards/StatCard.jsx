
import {
  Bug,
  CircleAlert,
  Clock3,
  CircleCheckBig,
  Users,
  FolderDot,
  Bell,
} from "lucide-react";

const StatCard = ({ title, value }) => {
  const getCardConfig = () => {
    switch (title) {
      case "Total Bugs":
        return {
          Icon: Bug,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg:
            "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10",
          subtitle: "All recorded defects",
          badge: "Total",
          badgeColor:
            "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        };

      case "Open Bugs":
        return {
          Icon: CircleAlert,
          iconColor: "text-rose-600 dark:text-rose-400",
          iconBg:
            "border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10",
          subtitle: "Needs immediate attention",
          badge: "Action Required",
          badgeColor:
            "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400",
        };

      case "In Progress":
        return {
          Icon: Clock3,
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg:
            "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
          subtitle: "Currently being resolved",
          badge: "Active",
          badgeColor:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
        };

      case "Resolved":
        return {
          Icon: CircleCheckBig,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          iconBg:
            "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
          subtitle: "Verified and completed",
          badge: "Resolved",
          badgeColor:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        };

      case "Users":
        return {
          Icon: Users,
          iconColor: "text-purple-600 dark:text-purple-400",
          iconBg:
            "border-purple-200 bg-purple-50 dark:border-purple-500/20 dark:bg-purple-500/10",
          subtitle: "Team members and QA",
          badge: "Team",
          badgeColor:
            "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
        };

      case "Projects":
        return {
          Icon: FolderDot,
          iconColor: "text-indigo-600 dark:text-indigo-400",
          iconBg:
            "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10",
          subtitle: "Active projects",
          badge: "Projects",
          badgeColor:
            "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400",
        };

      case "Notifications":
        return {
          Icon: Bell,
          iconColor: "text-sky-600 dark:text-sky-400",
          iconBg:
            "border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10",
          subtitle: "System alerts",
          badge: "Alerts",
          badgeColor:
            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400",
        };

      default:
        return {
          Icon: Bug,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg:
            "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
          subtitle: "System metric",
          badge: "Metric",
          badgeColor:
            "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  const config = getCardConfig();
  const Icon = config.Icon;

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border border-slate-200 bg-white p-5
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg
        dark:border-slate-800 dark:bg-slate-900/70
        dark:hover:border-slate-700 dark:hover:shadow-black/20
      "
    >
      {/* Subtle decorative accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Icon and badge */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${config.iconBg}`}
        >
          <Icon size={22} strokeWidth={1.9} className={config.iconColor} />
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.badgeColor}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Metric */}
      <p className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </p>

      <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value ?? 0}
      </h3>

      {/* Description */}
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-500">
        {config.subtitle}
      </p>
    </div>
  );
};

export default StatCard;
