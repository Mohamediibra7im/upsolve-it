"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
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
  blue: "border-sky-500/20 bg-sky-950/10 text-sky-400",
  emerald: "border-emerald-500/20 bg-emerald-950/10 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-955/10 text-amber-400",
  rose: "border-rose-500/20 bg-rose-955/10 text-rose-400",
  violet: "border-purple-500/20 bg-purple-955/10 text-purple-400",
  cyan: "border-cyan-500/20 bg-cyan-955/10 text-cyan-400",
};

const chartColors = {
  users: "#38bdf8",
  sessions: "#10b981",
  upsolves: "#f59e0b",
  admins: "#ef4444",
  members: "#10b981",
  ratings: "#a855f7",
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
    <div className="rounded-none border border-emerald-500/30 bg-[#060a08] px-3 py-2 text-[9px] font-mono shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-emerald-400">
      {label && (
        <div className="mb-1 font-bold border-b border-emerald-500/10 pb-0.5 uppercase tracking-wider text-emerald-300">
          NODE: {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={`${item.name}-${item.value}`}
            className="flex min-w-[140px] items-center justify-between gap-4"
          >
            <span className="font-bold uppercase tracking-widest opacity-60">
              {item.name}
            </span>
            <span className="font-bold text-emerald-300">
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
  if (loading) return <Skeleton className="h-6 w-16 bg-emerald-500/10 rounded-none" />;
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
    <Card className="rounded-none border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-md font-mono">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-none border border-emerald-500/20 bg-emerald-950/10 text-emerald-400">
            {icon}
          </div>
          <h3 className="truncate text-xs font-bold uppercase tracking-widest text-emerald-300">
            {title}
          </h3>
        </div>
        {value && (
          <Badge variant="outline" className="shrink-0 rounded-none border-emerald-500/25 text-emerald-400 font-bold text-[9px] uppercase tracking-wider bg-transparent">
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
      label: "TOTAL_USERS.DB",
      value: formatNumber(stats.totalUsers),
      detail: `${formatNumber(stats.recentlyJoinedUsers)} joined in 30 days`,
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "ACTIVE_USERS.SYS",
      value: formatNumber(stats.activeUsers),
      detail: "Active within 30 days",
      icon: Activity,
      tone: "emerald" as const,
    },
    {
      label: "PRACTICE_SESSIONS.LOG",
      value: formatNumber(stats.totalTrainings),
      detail: `${formatNumber(stats.completedTrainings)} completed`,
      icon: LineChart,
      tone: "violet" as const,
    },
    {
      label: "SOLVE_RATE.PCT",
      value: `${stats.solvingRate}%`,
      detail: `${formatNumber(stats.solvedTrainingProblems)} / ${formatNumber(
        stats.totalTrainingProblems,
      )} problems`,
      icon: Target,
      tone: "amber" as const,
    },
    {
      label: "ROADMAP_LEVELS.MAP",
      value: formatNumber(stats.totalLevels),
      detail: `${formatNumber(stats.totalLevelsCompleted)} levels completed`,
      icon: CheckCircle2,
      tone: "cyan" as const,
    },
    {
      label: "PEAK_PERFORMANCE.VAL",
      value: formatNumber(stats.bestPerformance),
      detail: `${formatNumber(stats.averagePerformance)} average`,
      icon: Trophy,
      tone: "rose" as const,
    },
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-mono text-emerald-400"
    >
      <Card className="rounded-none border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 rounded-none border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                <ShieldCheck className="size-3" />
                LIVE_TELEMETRY.SYS
              </Badge>
              <Badge variant="outline" className="gap-1 rounded-none border-emerald-500/20 text-emerald-500/50 font-bold text-[9px] uppercase tracking-wider bg-transparent">
                <Gauge className="size-3" />
                {completionRate}% sessions completed
              </Badge>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">
                ADMIN_HUB_DASHBOARD
              </h2>
              <p className="mt-1 max-w-2xl text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">
                Platform activity, user growth, and training health monitors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center lg:min-w-[420px]">
            {[
              { label: "ADMIN_SHARE", value: `${adminShare}%` },
              { label: "AVG_RATING", value: formatNumber(stats.averageRating) },
              {
                label: "OPEN_SESSIONS",
                value: formatNumber(stats.activeTrainings),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-none border border-emerald-500/10 bg-[#040604]/50 px-3 py-2.5"
              >
                <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-bold tracking-wider text-emerald-300">
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
            className="rounded-none border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-md transition-all hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">
                  {stat.label}
                </div>
                <div className="mt-3 text-2xl font-bold tracking-wider text-emerald-300 leading-none">
                  <MetricValue loading={statsLoading}>{stat.value}</MetricValue>
                </div>
                <div className="mt-2.5 truncate text-[9px] font-bold text-emerald-500/40 uppercase">
                  {stat.detail}
                </div>
              </div>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-none border bg-transparent",
                  toneClasses[stat.tone],
                )}
              >
                <stat.icon className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <ChartPanel
          icon={<LineChart className="size-3.5" />}
          title="SYS_ACTIVITY // 7_DAY_TREND"
          value={`${formatNumber(stats.activeUsers)} active`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full rounded-none bg-emerald-500/5" />
          ) : (
            <div className="h-[320px] min-w-0 font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.activityTrend}
                  margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(16, 185, 129, 0.05)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke={chartColors.users}
                    fill={chartColors.users}
                    fillOpacity={0.05}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke={chartColors.sessions}
                    fill={chartColors.sessions}
                    fillOpacity={0.05}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="upsolves"
                    name="Upsolves"
                    stroke={chartColors.upsolves}
                    fill={chartColors.upsolves}
                    fillOpacity={0.05}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<Users className="size-3.5" />}
          title="REGISTRY_ROLES"
          value={`${adminShare}% admin`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full rounded-none bg-emerald-500/5" />
          ) : (
            <div className="grid h-[320px] grid-rows-[1fr_auto] gap-4">
              {hasRoleData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={4}
                      stroke="#060a08"
                      strokeWidth={2}
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
                <div className="flex items-center justify-center rounded-none border border-dashed border-emerald-500/10 text-[10px] font-bold text-emerald-500/30 uppercase tracking-widest">
                  [ NO_USERS_DETECTED ]
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {roleData.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-none border border-emerald-500/10 bg-[#040604]/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-emerald-500/40">
                      <span
                        className="size-2 rounded-none"
                        style={{ backgroundColor: roleColors[index] }}
                      />
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm font-bold text-emerald-300">
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
          icon={<BarChart3 className="size-3.5" />}
          title="RATING_DISTRIBUTION"
          value={`${formatNumber(stats.totalUsers)} users`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full rounded-none bg-emerald-500/5" />
          ) : (
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.ratingBands}
                  margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(16, 185, 129, 0.05)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Users"
                    fill={chartColors.ratings}
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<Zap className="size-3.5" />}
          title="TRAINING_MODES"
          value={`${stats.solvingRate}% solve rate`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full rounded-none bg-emerald-500/5" />
          ) : (
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.trainingModes}
                  margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(16, 185, 129, 0.05)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 8,
                      fill: "rgba(16, 185, 129, 0.4)",
                      fontFamily: "monospace",
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="sessions"
                    name="Sessions"
                    fill={chartColors.volume}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="solved"
                    name="Solved"
                    fill={chartColors.solved}
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>
      </div>

      <Card className="rounded-none border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-md">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="size-3.5 text-emerald-500/40" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            SYSTEM_OPERATIONS_SNAPSHOT
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Verified Users",
              value: formatNumber(stats.verifiedUsers),
            },
            {
              label: "Unverified Users",
              value: formatNumber(stats.unverifiedUsers),
            },
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
            {
              label: "Total XP Earned",
              value: formatNumber(stats.totalXpEarned),
            },
            {
              label: "Topics Completed",
              value: formatNumber(stats.totalTopicsCompleted),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-none border border-emerald-500/10 bg-[#040604]/50 px-4 py-3"
            >
              <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">
                {item.label}
              </div>
              <div className="mt-1 text-sm font-bold tracking-wider text-emerald-300">
                <MetricValue loading={statsLoading}>{item.value}</MetricValue>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </m.div>
  );
}
