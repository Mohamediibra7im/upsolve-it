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
  blue: "border-sky-500/20 bg-sky-950/10 text-[#9fb8c7]",
  emerald: "border-[#2b3031] bg-[#131715] text-[#b5e3c4]",
  amber: "border-amber-500/20 bg-amber-400/5 text-amber-400",
  rose: "border-rose-500/20 bg-rose-400/5 text-[#cb9390]",
  violet: "border-purple-500/20 bg-purple-400/5 text-[#b5acd5]",
  cyan: "border-cyan-500/20 bg-cyan-400/5 text-[#a4c7c3]",
};

const chartColors = {
  users: "#9fb8c7",
  sessions: "#b5e3c4",
  upsolves: "#d3b98b",
  admins: "#cb9390",
  members: "#b5e3c4",
  ratings: "#b5acd5",
  solved: "#b5e3c4",
  volume: "#9fb8c7",
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
    <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] px-3 py-2 text-xs font-sans text-[#b5e3c4]">
      {label && (
        <div className="mb-1 font-medium border-b border-[#2b3031] pb-0.5 text-[#f1f3ee]">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={`${item.name}-${item.value}`}
            className="flex min-w-[140px] items-center justify-between gap-4"
          >
            <span className="font-medium opacity-60">{item.name}</span>
            <span className="font-medium text-[#f1f3ee]">
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
  if (loading)
    return <Skeleton className="h-6 w-16 bg-[#b5e3c4]/[0.06] rounded-xl" />;
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
    <Card className="rounded-[20px] border-[#2b3031] bg-[#191c1e] p-5 shadow-none font-sans">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#2b3031] bg-[#131715] text-[#b5e3c4]">
            {icon}
          </div>
          <h3 className="text-base font-medium leading-5 text-[#f1f3ee] font-heading tracking-tight">
            {title}
          </h3>
        </div>
        {value && (
          <Badge
            variant="outline"
            className="shrink-0 rounded-xl border-[#2b3031] text-[#b5e3c4] font-medium text-xs bg-transparent"
          >
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
      label: "Total members",
      value: formatNumber(stats.totalUsers),
      detail: `${formatNumber(stats.recentlyJoinedUsers)} joined in 30 days`,
      icon: Users,
      tone: "blue" as const,
    },
    {
      label: "Active members",
      value: formatNumber(stats.activeUsers),
      detail: "Active within 30 days",
      icon: Activity,
      tone: "emerald" as const,
    },
    {
      label: "Practice sessions",
      value: formatNumber(stats.totalTrainings),
      detail: `${formatNumber(stats.completedTrainings)} completed`,
      icon: LineChart,
      tone: "violet" as const,
    },
    {
      label: "Solve rate",
      value: `${stats.solvingRate}%`,
      detail: `${formatNumber(stats.solvedTrainingProblems)} / ${formatNumber(
        stats.totalTrainingProblems,
      )} problems`,
      icon: Target,
      tone: "amber" as const,
    },
    {
      label: "Roadmap levels",
      value: formatNumber(stats.totalLevels),
      detail: `${formatNumber(stats.totalLevelsCompleted)} levels completed`,
      icon: CheckCircle2,
      tone: "cyan" as const,
    },
    {
      label: "Best performance",
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
      className="space-y-6 font-sans text-[#f1f3ee]"
    >
      <Card className="rounded-[20px] border-[#2b3031] bg-[#191c1e] p-5 shadow-none">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 rounded-xl border border-[#2b3031] bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-medium text-xs">
                <ShieldCheck className="size-3" />
                Platform overview
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 rounded-xl border-[#2b3031] text-[#929b98] font-medium text-xs bg-transparent"
              >
                <Gauge className="size-3" />
                {completionRate}% sessions completed
              </Badge>
            </div>
            <div>
              <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
                Community overview
              </h2>
              <p className="mt-1 max-w-2xl text-xs font-medium text-[#929b98]">
                Follow member growth, training activity, and problem-solving
                progress.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center lg:min-w-[420px]">
            {[
              { label: "Admin share", value: `${adminShare}%` },
              {
                label: "Average rating",
                value: formatNumber(stats.averageRating),
              },
              {
                label: "Open sessions",
                value: formatNumber(stats.activeTrainings),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#2b3031] bg-[#101214] px-3 py-2.5"
              >
                <div className="text-xs font-medium text-[#929b98]">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-medium text-[#f1f3ee]">
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
            className="rounded-[20px] border-[#2b3031] bg-[#191c1e] p-5 shadow-none transition-all hover:border-[#2b3031]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#929b98]">
                  {stat.label}
                </div>
                <div className="mt-3 text-2xl font-medium text-[#f1f3ee] leading-none">
                  <MetricValue loading={statsLoading}>{stat.value}</MetricValue>
                </div>
                <div className="mt-2.5 truncate text-xs font-medium text-[#929b98]">
                  {stat.detail}
                </div>
              </div>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl border bg-transparent",
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
          title="Activity over the last 7 days"
          value={`${formatNumber(stats.activeUsers)} active`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full rounded-xl bg-[#b5e3c4]/[0.06]" />
          ) : (
            <div className="h-[320px] min-w-0 font-sans text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.activityTrend}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#2b3031"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
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
          title="Community roles"
          value={`${adminShare}% admin`}
        >
          {statsLoading ? (
            <Skeleton className="h-[320px] w-full rounded-xl bg-[#b5e3c4]/[0.06]" />
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
                      stroke="#191c1e"
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
                <div className="flex items-center justify-center rounded-xl border border-dashed border-[#2b3031] text-xs font-medium text-[#929b98]">
                  No members yet
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {roleData.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-[#2b3031] bg-[#101214] px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[#929b98]">
                      <span
                        className="size-2 rounded-xl"
                        style={{ backgroundColor: roleColors[index] }}
                      />
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[#f1f3ee]">
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
          title="Rating distribution"
          value={`${formatNumber(stats.totalUsers)} users`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full rounded-xl bg-[#b5e3c4]/[0.06]" />
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
                    stroke="#2b3031"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
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
          title="Training modes"
          value={`${stats.solvingRate}% solve rate`}
        >
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full rounded-xl bg-[#b5e3c4]/[0.06]" />
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
                    stroke="#2b3031"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={34}
                    tick={{
                      fontSize: 11,
                      fill: "#929b98",
                      fontFamily: "inherit",
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

      <Card className="rounded-[20px] border-[#2b3031] bg-[#191c1e] p-5 shadow-none">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="size-3.5 text-[#929b98]" />
          <h3 className="text-base font-medium text-[#f1f3ee] font-heading tracking-tight">
            Platform at a glance
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
              className="rounded-xl border border-[#2b3031] bg-[#101214] px-4 py-3"
            >
              <div className="text-xs font-medium text-[#929b98]">
                {item.label}
              </div>
              <div className="mt-1 text-sm font-medium text-[#f1f3ee]">
                <MetricValue loading={statsLoading}>{item.value}</MetricValue>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </m.div>
  );
}
