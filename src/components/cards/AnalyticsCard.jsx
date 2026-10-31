
const BugPriorityChart = ({
  high = 0,
  medium = 0,
  low = 0,
}) => {
  const priorities = [
    {
      label: "High",
      value: Number(high) || 0,
      color: "bg-rose-500",
      textColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Medium",
      value: Number(medium) || 0,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Low",
      value: Number(low) || 0,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const maxValue = Math.max(
    ...priorities.map((item) => item.value),
    1
  );

  const total = priorities.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Bug Priority
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Distribution by severity
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total bugs
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {total}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div
        className="flex h-48 items-end justify-around gap-4 border-b border-slate-200 px-2 dark:border-slate-700 sm:gap-8 sm:px-5"
        role="img"
        aria-label={`Bug priority chart: ${high} high, ${medium} medium, ${low} low priority bugs`}
      >
        {priorities.map((item) => {
          const barHeight =
            item.value === 0
              ? 0
              : Math.max((item.value / maxValue) * 100, 6);

          return (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                {item.value}
              </span>

              <div className="flex h-[130px] w-full max-w-16 items-end justify-center">
                <div
                  className={`w-full rounded-t-lg ${item.color} transition-all duration-500`}
                  style={{ height: `${barHeight}%` }}
                />
              </div>

              <span
                className={`mb-3 mt-3 text-center text-xs font-semibold sm:text-sm ${item.textColor}`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {priorities.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${item.color}`}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {item.label} Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BugPriorityChart;
