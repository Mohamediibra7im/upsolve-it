import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ClosingCall from "@/components/features/landing/ClosingCall";
import LadderRuler, {
  LADDER_BANDS,
  LADDER_MAX,
  LADDER_MIN,
} from "@/components/features/landing/LadderRuler";
import {
  EXAMPLE_SET,
  EXAMPLE_TARGET,
} from "@/components/features/landing/examples";
import { Rank } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/ladder");

const easiest = EXAMPLE_SET[0];
const hardest = EXAMPLE_SET[EXAMPLE_SET.length - 1];

export default function Page() {
  return (
    <>
      <div className="wrap">
        <header className="pb-10 pt-16 lg:pt-[72px]">
          <p className="t-eyebrow">The ladder</p>
          <h1 className="t-d1 mt-4 max-w-[1000px]">
            110 levels. One at a time.
          </h1>
        </header>
        <LadderRuler />

        <div className="grid items-start gap-x-6 gap-y-8 pb-[72px] pt-14 lg:grid-cols-12">
          <div className="grid content-start gap-4 lg:col-span-5">
            <h2 className="t-h1">Where the levels sit</h2>
            <p className="t-muted">
              Ladder levels target ratings from 900 to 4050 in 100-point steps.
              Upsolve It suggests the level that matches your Codeforces rating;
              you can step up or down before every session.
            </p>
            <Link
              href="/signup"
              className="u-btn u-btn--primary justify-self-start"
            >
              Find your level <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="u-panel overflow-x-auto lg:col-span-7">
            <table className="u-table">
              <thead>
                <tr>
                  <th>Codeforces rank</th>
                  <th className="num">Rating</th>
                  <th className="num">Share of the range</th>
                </tr>
              </thead>
              <tbody>
                {LADDER_BANDS.map((band, i) => (
                  <tr key={band.key}>
                    <td>
                      <Rank
                        rating={band.from}
                        name={band.name}
                        className="whitespace-nowrap [&>span]:normal-case"
                      />
                    </td>
                    <td className="num whitespace-nowrap">
                      {i === 0
                        ? `below ${band.to}`
                        : i === LADDER_BANDS.length - 1
                          ? `${band.from}+`
                          : `${band.from}–${band.to - 1}`}
                    </td>
                    <td className="num">
                      {Math.round(
                        ((band.to - band.from) / (LADDER_MAX - LADDER_MIN)) *
                          100,
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="grid gap-x-6 gap-y-8 border-t border-line-strong py-[72px] lg:grid-cols-12">
          <div className="grid content-start gap-4 lg:col-span-5">
            <h2 className="t-h1">Four problems, rising.</h2>
            <p className="t-muted">
              A ladder set starts with a problem you should solve and ends with
              one that asks for a new idea. Example ratings for a level with a{" "}
              <span className="t-num">{EXAMPLE_TARGET}</span> target.
            </p>
          </div>
          <div className="grid h-[220px] grid-cols-4 items-end gap-2 sm:gap-3 lg:col-span-7">
            {EXAMPLE_SET.map((rating, i) => (
              <div
                key={rating}
                style={{
                  height: `${40 + (60 * (rating - easiest)) / (hardest - easiest)}%`,
                }}
                className={cn(
                  "grid content-between rounded-md p-2 sm:p-4",
                  rating === hardest
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-sunk",
                )}
              >
                <b className="t-num">{"ABCD"[i]}</b>
                <span className="t-num text-lg font-semibold sm:text-[28px]">
                  {rating}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ClosingCall
        title={
          <>
            Start where
            <br />
            your rating says.
          </>
        }
      />
    </>
  );
}
