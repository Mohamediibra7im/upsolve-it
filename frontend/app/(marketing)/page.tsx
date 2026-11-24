import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import JsonLd from "@/components/shared/JsonLd";
import { GuestCall } from "@/components/features/profile/PublicProfileViewer";
import Faq, { LANDING_FAQ } from "@/components/features/landing/Faq";
import LadderRuler from "@/components/features/landing/LadderRuler";
import {
  QueueExample,
  SessionSheet,
} from "@/components/features/landing/examples";
import { MODES } from "@/components/features/landing/modes";
import { siteStructuredData } from "@/lib/siteStructuredData";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/");

const FACTS = [
  ["5", "training modes"],
  ["110", "ladder levels"],
  ["900–4050", "target ratings covered"],
  ["90", "days of contests imported"],
  ["1", "email a week, at most"],
];

const QUEUE_POINTS = [
  "Pulls what you attempted and missed in Codeforces contests, 90 days back.",
  "One sync marks a problem solved as soon as Codeforces accepts it.",
  "Dismiss a problem once and it never comes back.",
];

const LADDER_NOTES = [
  [
    "Your level, suggested.",
    "The ladder opens on the level that matches your Codeforces rating. Step it up or down before you start.",
  ],
  [
    "Four problems, rising.",
    "Each set climbs from a problem you should solve to one that asks for a new idea.",
  ],
  [
    "Ratings on or off.",
    "Hide the ratings when knowing the number changes how you think.",
  ],
];

function SectionHead({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-12 grid items-end gap-x-12 gap-y-4 lg:grid-cols-2">
      <h2 className="t-h1">{title}</h2>
      <p className="t-muted">{children}</p>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <JsonLd data={siteStructuredData} />
      <div className="wrap">
        <section className="grid items-center gap-x-6 gap-y-16 pb-20 pt-12 lg:grid-cols-12 lg:pb-[104px] lg:pt-[72px]">
          <div className="grid justify-items-start gap-7 lg:col-span-6">
            <p className="t-eyebrow">
              Competitive programming practice, with a plan
            </p>
            <h1 className="t-d1">Make your next solve count.</h1>
            <p className="t-lg t-muted max-w-[520px]">
              Timed problem sets built around your rating. Every problem you
              miss is kept for you until you solve it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="u-btn u-btn--primary u-btn--lg">
                Start practicing for free <ArrowUpRight aria-hidden="true" />
              </Link>
              <a href="#modes" className="u-btn u-btn--ghost u-btn--lg">
                See the five modes <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <p className="t-sm t-muted">
              Free to use. Sign up with your Codeforces handle.
            </p>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <div
              aria-hidden="true"
              className="absolute -inset-y-6 -right-[var(--gutter)] left-12 rounded-lg bg-primary lg:-inset-y-10 lg:left-24"
            />
            <SessionSheet className="u-panel--pop relative" />
          </div>
        </section>

        <section
          aria-label="Upsolve It in numbers"
          className="u-strip grid-cols-2 border-y border-line-strong lg:grid-cols-5 lg:[&>:first-child]:pl-0"
        >
          {FACTS.map(([value, label]) => (
            <div
              key={label}
              className="grid gap-2 max-lg:[&:nth-child(3)]:col-span-2"
            >
              <b className="t-num-lg xl:text-[40px]">{value}</b>
              <span className="t-muted">{label}</span>
            </div>
          ))}
        </section>

        <section id="modes" className="py-20">
          <SectionHead title="Five ways to train.">
            Every session is a set of problems chosen around your rating, with a
            clock. Pick the kind of work you need today.
          </SectionHead>
          <div className="u-panel overflow-x-auto">
            <table className="u-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Set</th>
                  <th>Time</th>
                  <th>What it trains</th>
                  <th>
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODES.map((mode) => (
                  <tr key={mode.id}>
                    <td>
                      <span className="flex items-center gap-2.5">
                        <mode.icon className="size-4" aria-hidden="true" />
                        <b>{mode.name}</b>
                      </span>
                    </td>
                    <td className="t-num whitespace-nowrap">
                      {mode.set} problems
                    </td>
                    <td className="t-num whitespace-nowrap">
                      {mode.minutes} min
                    </td>
                    <td>
                      <b className="font-semibold">{mode.purpose}</b>
                      <br />
                      <span className="t-sm t-muted">{mode.detail}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/modes#${mode.id}`}
                        className="u-btn u-btn--sm"
                        aria-label={`${mode.name} mode in detail`}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="u-inverse">
        <div className="wrap grid items-center gap-x-6 gap-y-10 py-16 lg:grid-cols-12 lg:py-[88px]">
          <div className="grid gap-5 lg:col-span-5">
            <p className="t-eyebrow">The upsolve queue</p>
            <h2 className="t-h1">
              There’s more to learn after the timer ends.
            </h2>
            <p className="text-ink-muted">
              The problems you didn’t solve stay within reach. Come back with a
              fresh perspective and make the second attempt your best one.
            </p>
            <ul className="grid gap-2.5">
              {QUEUE_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <QueueExample />
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="py-20">
          <SectionHead
            title={
              <>
                110 levels.
                <br />
                One at a time.
              </>
            }
          >
            The ladder runs from a 900 target to 4050 in 100-point steps. Start
            at the level recommended for your rating and move up when a set
            stops being hard.
          </SectionHead>
          <LadderRuler example={1342} />
          <div className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-3">
            {LADDER_NOTES.map(([title, text]) => (
              <p key={title}>
                <b>{title}</b>
                <br />
                <span className="t-muted">{text}</span>
              </p>
            ))}
          </div>
        </section>
        <hr className="rule" />
        <section className="grid gap-x-6 gap-y-8 py-20 lg:grid-cols-12">
          <div className="grid content-start gap-4 lg:col-span-4">
            <h2 className="t-h1">Before you sign up.</h2>
            <p className="t-muted">
              The short answers. The{" "}
              <Link href="/faq" className="t-link">
                FAQ
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="t-link">
                privacy policy
              </Link>{" "}
              have the long ones.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Faq items={LANDING_FAQ} />
          </div>
        </section>
      </div>

      <GuestCall
        title={
          <>
            A little better.
            <br />
            Every session.
          </>
        }
      />
    </>
  );
}
