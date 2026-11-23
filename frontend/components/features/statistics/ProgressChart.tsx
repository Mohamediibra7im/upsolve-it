import { Training } from "@/types/Training";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

const tick = {
  fill: "var(--ink-muted)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="formattedDate"
          tick={tick}
          tickLine={false}
          axisLine={false}
          interval={chartData.length <= 16 ? 0 : "preserveStartEnd"}
          angle={chartData.length > 6 ? -32 : 0}
          textAnchor={chartData.length > 6 ? "end" : "middle"}
          height={chartData.length > 6 ? 48 : 24}
        />
        <YAxis
          domain={yDomain}
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          cursor={{ stroke: "var(--line-strong)" }}
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as
              (typeof chartData)[number] | undefined;
            if (!row) return "";
            return `Session ${row.sessionNumber} · ${formatCalendarDay(row.startTime)}`;
          }}
          formatter={(value) => [value, "Performance"]}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-pop)",
            fontSize: 13,
            color: "var(--ink)",
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          itemStyle={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}
        />
        <Line
          type="linear"
          dataKey="performance"
          stroke="var(--accent-ink)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent-ink)", strokeWidth: 0 }}
          activeDot={{
            r: 5,
            fill: "var(--surface)",
            stroke: "var(--accent-ink)",
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
