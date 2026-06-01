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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  /**
   * Badges match the line: same sessions, same performance values.
   * (Solve-only filtering hid peaks when the highest session had no counted AC.)
   */
  const performances = chartData.map((d) => d.performance ?? 0);
  const bestPerformance =
    chartData.length > 0 ? Math.max(...performances) : null;
  const averagePerformance =
    chartData.length > 0
      ? Math.round(
          performances.reduce((sum, p) => sum + p, 0) / chartData.length,
        )
      : null;

  const getTrend = () => {
    if (chartData.length < 2)
      return { direction: "neutral" as const, value: 0 };

    const recent = chartData.slice(-3);
    const older = chartData.slice(-6, -3);

    if (older.length === 0)
      return { direction: "neutral" as const, value: 0 };

    const recentAvg =
      recent.reduce((sum, item) => sum + (item.performance ?? 0), 0) /
      recent.length;
    const olderAvg =
      older.reduce((sum, item) => sum + (item.performance ?? 0), 0) /
      older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 5)
      return { direction: "up" as const, value: difference };
    if (difference < -5)
      return {
        direction: "down" as const,
        value: Math.abs(difference),
      };
    return { direction: "neutral" as const, value: 0 };
  };

  const trend = getTrend();

  const summaryDisplay = (v: number | null) =>
    v == null || Number.isNaN(v) ? "-" : String(v);

  return (
    <Card className="w-full bg-gradient-to-br from-card via-card to-muted/10 border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              Performance Trends
              {trend.direction === "up" && (
                <TrendingUp className="h-5 w-5 text-green-500" aria-hidden />
              )}
              {trend.direction === "down" && (
                <TrendingDown className="h-5 w-5 text-red-500" aria-hidden />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Best is the highest point on this line; average is the mean of every
              session plotted (including sessions with no solves, which can still
              move the curve).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Badge variant="outline" className="text-xs tabular-nums">
              Best: {summaryDisplay(bestPerformance)}
            </Badge>
            <Badge variant="secondary" className="text-xs tabular-nums">
              Avg: {summaryDisplay(averagePerformance)}
            </Badge>
            {trend.direction !== "neutral" && (
              <Badge
                variant={trend.direction === "up" ? "default" : "destructive"}
                className="text-xs tabular-nums"
              >
                {trend.direction === "up" ? "↗" : "↘"}{" "}
                {Math.round(trend.value)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <ResponsiveContainer
          width="100%"
          height={250}
          className="sm:h-[300px] lg:h-[350px]"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/30"
              vertical={false}
            />
            <XAxis
              dataKey="formattedDate"
              className="text-muted-foreground text-xs sm:text-sm"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={chartData.length <= 16 ? 0 : "preserveStartEnd"}
              angle={chartData.length > 6 ? -32 : 0}
              textAnchor={chartData.length > 6 ? "end" : "middle"}
              height={chartData.length > 6 ? 52 : 28}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(value) => `${value}`}
              className="text-muted-foreground text-xs sm:text-sm"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
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
                return `Session ${row.sessionNumber} (${formatCalendarDay(row.startTime)})`;
              }}
              formatter={(value: any) => [`${value}`, "Performance"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "14px",
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                border: "1px solid hsl(var(--border))",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: "600",
              }}
            />
            <Area
              type="monotone"
              dataKey="performance"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#performanceGradient)"
              dot={{
                fill: "hsl(var(--primary))",
                strokeWidth: 2,
                r: 4,
                stroke: "hsl(var(--background))",
              }}
              activeDot={{
                r: 7,
                strokeWidth: 3,
                stroke: "hsl(var(--primary))",
                fill: "hsl(var(--background))",
                className: "drop-shadow-lg",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
