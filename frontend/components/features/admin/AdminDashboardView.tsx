"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminStats } from "@/hooks/admin/useAdminStats";
import { Stat } from "@/components/ui/kit";

const ACTIVITY_SERIES = [
  { key: "users", name: "Users", color: "var(--accent-ink)" },
  { key: "sessions", name: "Sessions", color: "var(--solved)" },
  { key: "upsolves", name: "Upsolves", color: "var(--pending)" },
] as const;

const tick = {
  fontSize: 11,
  fill: "var(--ink-muted)",
  fontFamily: "var(--font-mono)",
};

const fmt = (value: number) => value.toLocaleString("en-US");
const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string | number; value?: string | number }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="t-sm min-w-36 rounded-md border border-line-strong bg-surface px-3 py-2 shadow-pop">
      {label && <b className="mb-1 block">{label}</b>}
      {payload.map((item) => (
        <div key={item.name} className="flex justify-between gap-4">
          <span className="t-muted">{item.name}</span>
          <span className="t-num">
            {typeof item.value === "number" ? fmt(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="u-panel">
      <div className="u-panel__head">
        <h2 className="t-h2">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Chart({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactElement;
}) {
  return (
    <div className="u-panel__body">
      {loading ? (
        <div className="h-[280px] animate-pulse rounded-md bg-surface-sunk" />
      ) : (
        <div className="h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const frame = [
  <CartesianGrid key="grid" vertical={false} stroke="var(--line)" />,
  <XAxis
    key="x"
    dataKey="label"
    tickLine={false}
    axisLine={false}
    tick={tick}
  />,
  <YAxis
    key="y"
    allowDecimals={false}
    tickLine={false}
    axisLine={false}
    width={40}
    tick={tick}
  />,
];

export function AdminDashboardView({
  stats,
  statsLoading,
}: Readonly<{ stats: AdminStats; statsLoading: boolean }>) {
  const n = (value: number) => (statsLoading ? "–" : fmt(value));
  // ratings are written without a thousands separator, as on Codeforces
  const r = (value: number) => (statsLoading ? "–" : String(Math.round(value)));
  const share = (part: number, whole: number) =>
    statsLoading ? "–" : `${fmt(part)} · ${pct(part, whole)}%`;
  const kv = (rows: [string, string][]) =>
    rows.map(([label, value]) => (
      <div key={label} className="u-kv">
        <span>{label}</span>
        <b>{value}</b>
      </div>
    ));

  return (
    <div className="grid gap-6">
      <div className="u-panel u-strip">
        <Stat
          label="Users"
          value={n(stats.totalUsers)}
          sub={`${n(stats.recentlyJoinedUsers)} joined in the last 30 days`}
        />
        <Stat
          label="Active users"
          value={n(stats.activeUsers)}
          sub="Active in the last 30 days"
        />
        <Stat
          label="Sessions"
          value={n(stats.totalTrainings)}
          sub={`${n(stats.completedTrainings)} finished`}
        />
        <Stat
          label="Solve rate"
          value={statsLoading ? "–" : stats.solvingRate}
          unit={statsLoading ? undefined : "%"}
          sub={`${n(stats.solvedTrainingProblems)} of ${n(stats.totalTrainingProblems)} problems`}
        />
        <Stat
          label="Best performance"
          value={r(stats.bestPerformance)}
          sub={`${r(stats.averagePerformance)} on average`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid content-start gap-6 lg:col-span-8">
          <Panel
            title="Activity, last 7 days"
            aside={
              <ul className="t-sm t-muted flex flex-wrap gap-4">
                {ACTIVITY_SERIES.map((s) => (
                  <li key={s.key} className="flex items-center gap-2">
                    <i
                      aria-hidden="true"
                      className="size-2 rounded-sm"
                      style={{ background: s.color }}
                    />
                    {s.name}
                  </li>
                ))}
              </ul>
            }
          >
            <Chart loading={statsLoading}>
              <LineChart
                data={stats.activityTrend}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                {frame}
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "var(--line-strong)" }}
                />
                {ACTIVITY_SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </Chart>
          </Panel>

          <Panel title="Rating distribution">
            <Chart loading={statsLoading}>
              <BarChart
                data={stats.ratingBands}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                {frame}
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--surface-sunk)" }}
                />
                <Bar
                  dataKey="count"
                  name="Users"
                  fill="var(--accent-ink)"
                  isAnimationActive={false}
                />
              </BarChart>
            </Chart>
          </Panel>
        </div>

        <div className="grid content-start gap-6 lg:col-span-4">
          <Panel title="Users">
            {kv([
              ["Regular users", n(stats.regularUsers)],
              ["Admins", share(stats.adminUsers, stats.totalUsers)],
              ["Verified", n(stats.verifiedUsers)],
              ["Unverified", n(stats.unverifiedUsers)],
              ["Average rating", r(stats.averageRating)],
            ])}
          </Panel>

          <Panel title="Sessions">
            {kv([
              [
                "Finished",
                share(stats.completedTrainings, stats.totalTrainings),
              ],
              ["Open now", n(stats.activeTrainings)],
              ["Abandoned", n(stats.abandonedTrainings)],
              ["Problems solved", n(stats.solvedTrainingProblems)],
              ["Upsolves finished", n(stats.completedUpsolves)],
            ])}
          </Panel>

          <Panel title="Training modes">
            <div className="overflow-x-auto">
              <table className="u-table">
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th className="num">Sessions</th>
                    <th className="num">Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trainingModes.map((mode) => (
                    <tr key={mode.mode}>
                      <td>
                        <b>{mode.label}</b>
                      </td>
                      <td className="num">{n(mode.sessions)}</td>
                      <td className="num">{n(mode.solved)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
