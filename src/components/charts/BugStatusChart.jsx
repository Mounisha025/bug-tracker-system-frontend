import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6", // Open - Blue
  "#F59E0B", // In Progress - Amber
  "#10B981", // Resolved - Emerald
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.payload.fill }}
          />
          <span className="text-xs font-medium text-slate-300">
            {item.name}:
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

const BugStatusChart = ({
  open = 0,
  progress = 0,
  resolved = 0,
}) => {
  const data = [
    {
      name: "Open",
      value: open,
    },
    {
      name: "In Progress",
      value: progress,
    },
    {
      name: "Resolved",
      value: resolved,
    },
  ];

  const total = open + progress + resolved;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Bugs by Status</h2>
          <p className="text-xs text-slate-400">Distribution across resolution workflow</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
          {total} Total
        </span>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span className="text-xs font-medium text-slate-300 mr-3">
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Defects
          </span>
        </div>
      </div>
    </div>
  );
};

export default BugStatusChart;