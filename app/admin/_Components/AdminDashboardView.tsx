"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Gauge,
  LineChart,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  UserPlus,
  Zap,
} from "lucide-react";
import type { AdminStats } from "@/hooks/admin/useAdminStats";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminDashboardViewProps {
  stats: AdminStats;
  statsLoading: boolean;
}

type Tone = "blue" | "emerald" | "amber" | "rose" | "violet" | "cyan";

type TooltipPayload = {
  color?: string;
  name?: string | number;
  value?: string | number;
};

const toneClasses: Record<Tone, string> = {
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-500",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-500",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
};

const chartColors = {
  users: "#2563eb",
  sessions: "#16a34a",
  upsolves: "#f59e0b",
  admins: "#f97316",
  members: "#0891b2",
  ratings: "#7c3aed",
  solved: "#10b981",
  volume: "#3b82f6",
};

const roleColors = [chartColors.members, chartColors.admins];

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && (
        <div className="mb-1 font-bold text-foreground tabular-nums">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={`${item.name}-${item.value}`}
            className="flex min-w-[150px] items-center justify-between gap-4"
          >
            <span className="font-medium" style={{ color: item.color }}>
              {item.name}
            </span>
            <span className="font-black tabular-nums text-foreground">
              {typeof item.value === "number"
                ? formatNumber(item.value)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricValue({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  if (loading) return <Skeleton className="h-8 w-24" />;
  return <>{children}</>;
}

function ChartPanel({
  icon,
  title,
  value,
  children,
}: {
  icon: ReactNode;
  title: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-xl border-border/70 bg-card/85 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
            {icon}
          </div>
          <h3 className="truncate text-sm font-black uppercase tracking-wide text-foreground">
            {title}
          </h3>
        </div>
        {value && (
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {value}
          </Badge>
        )}
      </div>
      {children}
    </Card>
  );
}

export function AdminDashboardView({
  stats,
  statsLoading,
}: Readonly<AdminDashboardViewProps>) {
  const adminShare =
    stats.totalUsers > 0
      ? Math.round((stats.adminUsers / stats.totalUsers) * 100)
      : 0;
  const completionRate =
    stats.totalTrainings > 0
      ? Math.round((stats.completedTrainings / stats.totalTrainings) * 100)
      : 0;
  const roleData = [
    { name: "Members", value: stats.regularUsers },
    { name: "Admins", value: stats.adminUsers },
  ];
  const hasRoleData = roleData.some((item) => item.value > 0);

  const kpis = [
    {
      label: "Total Users",
      value: formatNumber(stats.totalUsers),
      detail: `${formatNumber(stats.recentlyJoinedUsers)} joined in 30 days`,
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "Active Users",
      value: formatNumber(stats.activeUsers),
      detail: "Training or upsolve in 30 days",
      icon: Activity,
      tone: "emerald" as const,
    },
    {
      label: "Practice Sessions",
      value: formatNumber(stats.totalTrainings),
      detail: `${formatNumber(stats.completedTrainings)} completed`,
      icon: LineChart,
      tone: "violet" as const,
    },
    {
      label: "Solve Rate",
      value: `${stats.solvingRate}%`,
      detail: `${formatNumber(stats.solvedTrainingProblems)} / ${formatNumber(
        stats.totalTrainingProblems,
      )} problems`,
      icon: Target,
      tone: "amber" as const,
    },
    {
      label: "Upsolves",
      value: formatNumber(stats.totalUpsolvedProblems),
      detail: `${stats.upsolveSolveRate}% completed`,
      icon: CheckCircle2,
      tone: "cyan" as const,
    },
    {
      label: "Best Perf",
      value: formatNumber(stats.bestPerformance),
      detail: `${formatNumber(stats.averagePerformance)} average`,
      icon: Trophy,
      tone: "rose" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="rounded-xl border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live stats
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                {completionRate}% sessions completed
              </Badge>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Admin Dashboard
              </h2>
              <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
                Platform activity, user growth, and training health in one view.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center lg:min-w-[420px]">
            {[
              { label: "Admin Share", value: `${adminShare}%` },
              { label: "Avg Rating", value: formatNumber(stats.averageRating) },
              {
                label: "Open Sessions",
                value: formatNumber(stats.activeTrainings),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border/70 bg-background/60 px-3 py-3"
              >
                <div className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 text-xl font-black tabular-nums text-foreground">
                  <MetricValue loading={statsLoading}>{item.value}</MetricValue>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-border/70 bg-card/85 p-5 shadow-sm transition-colors hover:border-primary/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-3 text-3xl font-black tabular-nums tracking-tight text-foreground">
                  <MetricValue loading={statsLoading}>{stat.value}</MetricValue>
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-muted-foreground">
                  {stat.detail}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                  toneClasses[stat.tone],
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <ChartPanel
          icon={<LineChart className="h-4 w-4" />}
          title="7-Day Activity"
          value={`${formatNumber(stats.activeUsers)} active`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.activityTrend}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/40"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New users"
                    stroke={chartColors.users}
                    fill={chartColors.users}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke={chartColors.sessions}
                    fill={chartColors.sessions}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="upsolves"
                    name="Upsolves"
                    stroke={chartColors.upsolves}
                    fill={chartColors.upsolves}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<Users className="h-4 w-4" />}
          title="User Roles"
          value={`${adminShare}% admin`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="grid h-[320px] grid-rows-[1fr_auto] gap-3">
              {hasRoleData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                    >
                      {roleData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={roleColors[index % roleColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border text-sm font-semibold text-muted-foreground">
                  No users yet
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {roleData.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: roleColors[index] }}
                      />
                      {item.name}
                    </div>
                    <div className="mt-1 text-lg font-black tabular-nums text-foreground">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          icon={<BarChart3 className="h-4 w-4" />}
          title="Rating Distribution"
          value={`${formatNumber(stats.totalUsers)} users`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.ratingBands}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/40"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Users"
                    fill={chartColors.ratings}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<Zap className="h-4 w-4" />}
          title="Training Modes"
          value={`${stats.solvingRate}% solve rate`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.trainingModes}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/40"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="sessions"
                    name="Sessions"
                    fill={chartColors.volume}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="solved"
                    name="Solved"
                    fill={chartColors.solved}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>
      </div>

      <Card className="rounded-xl border-border/70 bg-card/85 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
            Operations Snapshot
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Completed Sessions",
              value: formatNumber(stats.completedTrainings),
            },
            {
              label: "Abandoned Sessions",
              value: formatNumber(stats.abandonedTrainings),
            },
            {
              label: "Solved Training Problems",
              value: formatNumber(stats.solvedTrainingProblems),
            },
            {
              label: "Completed Upsolves",
              value: formatNumber(stats.completedUpsolves),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border/70 bg-background/60 px-4 py-3"
            >
              <div className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                {item.label}
              </div>
              <div className="mt-1 text-xl font-black tabular-nums text-foreground">
                <MetricValue loading={statsLoading}>{item.value}</MetricValue>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
