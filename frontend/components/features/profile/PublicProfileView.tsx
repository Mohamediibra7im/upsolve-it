import { Stat } from "@/components/ui/kit";
import type { ProfileLinks } from "@/types/User";
import { SITE_NAME } from "@/lib/seo";
import ProfileHero from "./ProfileHero";
import { GuestCall, OwnerEditLink } from "./PublicProfileViewer";

/** Everything GET /api/public-profile/:handle returns. */
export type PublicProfile = {
  handle: string;
  avatar: string;
  glyphAvatar?: string;
  displayName?: string;
  bio?: string;
  links?: Partial<ProfileLinks>;
  rating: number;
  maxRating: number;
  rank: string;
  organization: string | null;
  /** "YYYY-MM" */
  joined: string;
  stats: {
    sessions: number;
    solved: number;
    upsolved: number;
    currentStreak: number;
    longestStreak: number;
  };
  /** Problems solved per UTC day ("YYYY-MM-DD") over the past year. */
  activity: Record<string, number>;
};

const DAY_MS = 86_400_000;
const WEEKS = 53;
const plural = (n: number, word: string) =>
  `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;

/** The past year as whole weeks (Sunday first), ending with the current week. */
function activityWeeks(activity: Record<string, number>) {
  const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;
  const start =
    today - (new Date(today).getUTCDay() + (WEEKS - 1) * 7) * DAY_MS;
  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    const date = new Date(start + i * DAY_MS);
    return date.getTime() > today
      ? null
      : { date, solved: activity[date.toISOString().slice(0, 10)] ?? 0 };
  });
}

export default function PublicProfileView({
  profile,
}: {
  profile: PublicProfile;
}) {
  const { handle, stats } = profile;
  const since = new Date(`${profile.joined}-01T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  const days = activityWeeks(profile.activity);
  const past = days.filter((d) => d !== null);
  const solvedThisYear = past.reduce((sum, d) => sum + d.solved, 0);
  const activeDays = past.filter((d) => d.solved > 0).length;
  const summary = `${plural(solvedThisYear, "problem")} solved on ${plural(activeDays, "day")} in the past 12 months`;
  // A month's name sits over the first week that starts in it.
  const months = Array.from({ length: WEEKS }, (_, week) => {
    const first = days[week * 7]?.date ?? null;
    const before = week > 0 ? days[(week - 1) * 7]?.date : null;
    return first && (!before || before.getUTCMonth() !== first.getUTCMonth())
      ? first.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
      : null;
  });

  return (
    <>
      <div className="wrap grid gap-6 pb-16 pt-10">
        <ProfileHero
          eyebrow={`On ${SITE_NAME} since ${since}`}
          person={{ ...profile, codeforcesHandle: handle }}
          actions={<OwnerEditLink handle={handle} />}
        />

        <section className="u-panel u-strip" aria-label="Practice totals">
          <Stat
            label="Training sessions"
            value={stats.sessions.toLocaleString("en-US")}
          />
          <Stat
            label="Solved in training"
            value={stats.solved.toLocaleString("en-US")}
          />
          <Stat
            label="Upsolved"
            value={stats.upsolved.toLocaleString("en-US")}
          />
          <Stat
            label="Current streak"
            value={stats.currentStreak}
            unit={stats.currentStreak === 1 ? "day" : "days"}
          />
          <Stat
            label="Longest streak"
            value={stats.longestStreak}
            unit={stats.longestStreak === 1 ? "day" : "days"}
          />
        </section>

        <section className="u-panel" aria-labelledby="activity-title">
          <div className="u-panel__head">
            <h2 id="activity-title" className="t-h2">
              Practice activity
            </h2>
            <span className="u-heat-legend" aria-hidden="true">
              Less
              {[0, 1, 2, 3, 4].map((level) => (
                <i key={level} style={{ background: `var(--heat-${level})` }} />
              ))}
              More
            </span>
          </div>
          <div className="u-panel__body overflow-x-auto">
            <div className="grid min-w-[720px] gap-2">
              <div
                className="t-sm t-num t-muted grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
                }}
                aria-hidden="true"
              >
                {months.map((month, week) => (
                  <span key={week} className="whitespace-nowrap">
                    {month}
                  </span>
                ))}
              </div>
              <div
                className="u-heat u-heat--fill"
                role="img"
                aria-label={`Practice activity by day: ${summary}`}
              >
                {days.map((day, i) =>
                  day ? (
                    <i
                      key={i}
                      data-l={Math.min(day.solved, 4)}
                      title={`${day.date.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}: ${day.solved} solved`}
                    />
                  ) : (
                    <span key={i} />
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="u-panel__foot">
            <span>{summary}</span>
            <span>One square is one day, in UTC.</span>
          </div>
        </section>
      </div>

      <GuestCall />
    </>
  );
}
