import { Suspense } from "react";
import { connection } from "next/server";
import ContestCalendar from "@/components/features/contests/ContestCalendar";
import { serverApiFetch } from "@/lib/serverApi";
import { publicPageMetadata } from "@/lib/seo";
import { JUDGES, type ContestSchedule } from "@/types/Contest";

export const metadata = publicPageMetadata("/contests");

/**
 * The schedule and the moment it was read. The API keeps its own copy of each
 * judge's list, so asking it every five minutes is enough. When it cannot be
 * reached the page still renders, and says that neither judge was read.
 */
async function loadSchedule(): Promise<ContestSchedule & { readAt: number }> {
  try {
    const res = await serverApiFetch("/api/contests/upcoming", 300);
    if (!res.ok) throw new Error(`Contests request failed (${res.status})`);
    const schedule: ContestSchedule = await res.json();
    return { ...schedule, readAt: Date.now() };
  } catch {
    return { contests: [], unavailable: [...JUDGES], readAt: Date.now() };
  }
}

export default async function Page() {
  // Rendered for each visit: the countdown starts from the moment of the request.
  await connection();
  const { contests, unavailable, readAt } = await loadSchedule();
  return (
    <>
      <div className="wrap pb-[88px]">
        <header className="grid items-end gap-x-12 gap-y-6 pb-10 pt-16 lg:grid-cols-2 lg:pt-[72px]">
          <div>
            <p className="t-eyebrow">Contest calendar</p>
            <h1 className="t-d2 mt-4">Upcoming rounds.</h1>
          </div>
          <p className="t-lg t-muted">
            Every Codeforces and AtCoder round that has not started yet, with
            start times in your own time zone.
          </p>
        </header>
        {/* it reads ?judge= from the address */}
        <Suspense>
          <ContestCalendar
            contests={contests}
            unavailable={unavailable}
            renderedAt={readAt}
          />
        </Suspense>
      </div>
    </>
  );
}
