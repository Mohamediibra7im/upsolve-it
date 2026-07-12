import { Training } from "@/types/Training";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

function formatCalendarDay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatAxisLabel(
  startTime: number,
  prevStartTime: number | null,
): string {
  const d = new Date(startTime);
  const dateStr = formatCalendarDay(startTime);
  if (prevStartTime != null) {
    const prev = new Date(prevStartTime);
    if (
      d.getFullYear() === prev.getFullYear() &&
      d.getMonth() === prev.getMonth() &&
      d.getDate() === prev.getDate()
    ) {
      return `${dateStr} ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })}`;
    }
  }
  return dateStr;
}

const ProgressChart = ({ history }: { history: Training[] }) => {
  const sorted = [...history].sort((a, b) => a.startTime - b.startTime);

  const chartData = sorted.map((training, index) => ({
    ...training,
    sessionNumber: index + 1,
    formattedDate: formatAxisLabel(
      training.startTime,
      index > 0 ? sorted[index - 1].startTime : null,
    ),
  }));

  const perfValues = chartData
    .map((d) => d.performance)
    .filter((v) => typeof v === "number" && Number.isFinite(v));
  const minPerf = perfValues.length > 0 ? Math.min(...perfValues) : 0;
  const maxPerf = perfValues.length > 0 ? Math.max(...perfValues) : 100;
  const span = maxPerf - minPerf || 100;
  const pad = Math.max(80, span * 0.1);
  const yDomain: [number, number] = [
    Math.max(400, Math.floor(minPerf - pad)),
    Math.min(4000, Math.ceil(maxPerf + pad)),
  ];

  return (
    <div className="w-full font-mono text-emerald-400">
      <div className="relative overflow-hidden rounded-lg border border-emerald-500/15 bg-[#060a08]/30 p-4">
        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.04]" />
        
        <ResponsiveContainer
          width="100%"
          height={260}
          className="sm:h-[300px]"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(16,185,129,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: "rgba(16,185,129,0.4)", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval={chartData.length <= 16 ? 0 : "preserveStartEnd"}
              angle={chartData.length > 6 ? -32 : 0}
              textAnchor={chartData.length > 6 ? "end" : "middle"}
              height={chartData.length > 6 ? 48 : 24}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: "rgba(16,185,129,0.4)", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as
                  | (Training & {
                      sessionNumber: number;
                      formattedDate: string;
                    })
                  | undefined;
                if (!row) return "";
                return `RUN #${String(row.sessionNumber).padStart(2, "0")} (${formatCalendarDay(row.startTime)})`;
              }}
              formatter={(value: any) => [`${value} pts`, "PERF"]}
              contentStyle={{
                backgroundColor: "#060a08",
                borderColor: "rgba(16,185,129,0.3)",
                borderRadius: "4px",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#10b981",
                boxShadow: "0 0 10px rgba(16,185,129,0.1)",
              }}
              labelStyle={{
                color: "#a7f3d0",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            />
            <Area
              type="monotone"
              dataKey="performance"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#performanceGradient)"
              dot={{
                fill: "#10b981",
                strokeWidth: 1.5,
                r: 3,
                stroke: "#060a08",
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "#10b981",
                fill: "#060a08",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
