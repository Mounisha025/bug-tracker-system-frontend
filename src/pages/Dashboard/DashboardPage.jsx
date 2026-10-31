
import { useContext, useEffect, useState } from "react";

import { BugContext } from "../../context/BugContext";
import { AuthContext } from "../../context/AuthContext";

import StatCard from "../../components/cards/StatCard";
import RecentBugsTable from "../../components/ui/RecentBugsTable";

import BugStatusChart from "../../components/charts/BugStatusChart";
import BugPriorityChart from "../../components/charts/BugPriorityChart";

import { getDashboardStats } from "../../api/dashboardApi";

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { bugs = [] } = useContext(BugContext);

  const [stats, setStats] = useState(null);

  const totalBugs = bugs.length;

  const openBugs = bugs.filter(
    (bug) => bug.status === "OPEN"
  ).length;

  const progressBugs = bugs.filter(
    (bug) => bug.status === "IN_PROGRESS"
  ).length;

  const resolvedBugs = bugs.filter(
    (bug) => bug.status === "RESOLVED"
  ).length;

  const highPriority = bugs.filter(
    (bug) => bug.priority === "HIGH"
  ).length;

  const mediumPriority = bugs.filter(
    (bug) => bug.priority === "MEDIUM"
  ).length;

  const lowPriority = bugs.filter(
    (bug) => bug.priority === "LOW"
  ).length;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response);
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="app-page min-h-full space-y-8">
      {/* Dashboard Header */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {user?.name || "User"}
              </span>{" "}
              👋
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Today's overview
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Project health at a glance
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Here's what's happening with your projects today.
        </p>
      </header>

      {/* Main Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Bugs"
            value={stats?.totalBugs ?? totalBugs}
          />

          <StatCard
            title="Open Bugs"
            value={stats?.openBugs ?? openBugs}
          />

          <StatCard
            title="In Progress"
            value={stats?.inProgressBugs ?? progressBugs}
          />

          <StatCard
            title="Resolved"
            value={stats?.resolvedBugs ?? resolvedBugs}
          />

          <StatCard
            title="Users"
            value={stats?.totalUsers ?? 0}
          />

          <StatCard
            title="Projects"
            value={stats?.totalProjects ?? 0}
          />

          <StatCard
            title="Notifications"
            value={stats?.totalNotifications ?? 0}
          />
        </div>
      </section>

      {/* Priority Statistics remain available for future use */}
      {/*
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard title="High Priority" value={highPriority} />
        <StatCard title="Medium Priority" value={mediumPriority} />
        <StatCard title="Low Priority" value={lowPriority} />
      </section>
      */}

      {/* Charts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Bug Analytics
        </h2>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BugStatusChart
            open={openBugs}
            progress={progressBugs}
            resolved={resolvedBugs}
          />

          <BugPriorityChart
            high={highPriority}
            medium={mediumPriority}
            low={lowPriority}
          />
        </div>
      </section>

      {/* Recent Bugs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Recent Bugs
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review the latest reported issues.
          </p>
        </div>

        <RecentBugsTable bugs={bugs} />
      </section>
    </div>
  );
};

export default DashboardPage;
