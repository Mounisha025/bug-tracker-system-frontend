import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

const PRIORITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const color = PRIORITY_COLORS[item.payload.priority] || "#3b82f6";
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium text-slate-300">
            {item.payload.priority}:
          </span>
          <span className="text-xs font-bold text-white">
            {item.value} bugs
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const BugPriorityChart = ({
  high = 0,
  medium = 0,
  low = 0,
}) => {
  const data = [
    {
      priority: "HIGH",
      bugs: high,
    },
    {
      priority: "MEDIUM",
      bugs: medium,
    },
    {
      priority: "LOW",
      bugs: low,
    },
  ];

  const total = high + medium + low;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Bugs by Priority</h2>
          <p className="text-xs text-slate-400">Severity distribution across system</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
          {total} Total
        </span>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="priority"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="bugs"
            radius={[8, 8, 0, 0]}
            maxBarSize={55}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={PRIORITY_COLORS[entry.priority]}
                className="transition-opacity hover:opacity-85"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BugPriorityChart;