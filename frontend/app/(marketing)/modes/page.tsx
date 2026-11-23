import { ClipboardCheck, RefreshCw, Tags, Timer } from "lucide-react";
import ClosingCall from "@/components/features/landing/ClosingCall";
import { MODES } from "@/components/features/landing/modes";
import { Stat } from "@/components/ui/kit";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/modes");

// The rating windows are drawn on one scale: 400 below your rating to 300 above.
const SCALE_FROM = -400;
const SCALE_TO = 300;
const at = (offset: number) =>
  `${((offset - SCALE_FROM) / (SCALE_TO - SCALE_FROM)) * 100}%`;
const signed = (offset: number) =>
  offset < 0 ? `${-offset} below` : `${offset} above`;

const INCLUDED = [
  {
    icon: Tags,
    title: "Topic filter",
    text: "Limit a set to the topics you choose.",
  },
  {
    icon: Timer,
    title: "A clock per problem",
    text: "See where the time went, problem by problem.",
  },
  {
    icon: RefreshCw,
    title: "Live verdicts",
    text: "Results arrive from your Codeforces submissions.",
  },
  {
    icon: ClipboardCheck,
    title: "A review afterwards",
    text: "Time against expected, attempts, and what to revisit.",
  },
];

export default function Page() {
  return (
    <>
      <div className="wrap">
        <header className="grid items-end gap-x-12 gap-y-6 pb-14 pt-16 lg:grid-cols-2 lg:pt-[72px]">
          <div>
            <p className="t-eyebrow">Training modes</p>
            <h1 className="t-d1 mt-4">Five ways to train.</h1>
          </div>
          <p className="t-lg t-muted">
            Every session is a timed set of problems chosen around your rating.
            The mode decides how hard, how long and how much you are told.
          </p>
        </header>

        {MODES.map((mode) => (
          <section
            key={mode.id}
            id={mode.id}
            className="grid items-center gap-6 border-t border-line py-9 lg:grid-cols-12"
          >
            <div className="grid gap-2.5 lg:col-span-4">
              <div className="flex items-center gap-3">
                <mode.icon
                  className="size-[22px] shrink-0"
                  aria-hidden="true"
                />
                <h2 className="t-h1">{mode.name}</h2>
              </div>
              <p className="t-muted">{mode.purpose}</p>
            </div>
            <div className="flex gap-8 lg:col-span-3">
              <Stat label="Set" value={mode.set} />
              <Stat label="Time" value={mode.minutes} unit="min" />
            </div>
            <div className="grid gap-2.5 lg:col-span-5">
              <p>{mode.detail}</p>
              {mode.window && (
                <>
                  <div
                    role="img"
                    aria-label={`Problem ratings from ${signed(mode.window[0])} to ${signed(mode.window[1])} your rating`}
                    className="relative h-9 rounded-sm bg-surface-sunk"
                  >
                    <i
                      className="absolute inset-y-0 rounded-sm bg-accent-ink"
                      style={{
                        left: at(mode.window[0]),
                        right: `calc(100% - ${at(mode.window[1])})`,
                      }}
                    />
                    <i
                      className="absolute -inset-y-1.5 w-0.5 bg-ink"
                      style={{ left: at(0) }}
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="t-num t-sm t-muted relative h-5"
                  >
                    <span className="absolute left-0">−400</span>
                    <span
                      className="absolute -translate-x-1/2"
                      style={{ left: at(0) }}
                    >
                      your rating
                    </span>
                    <span className="absolute right-0">+300</span>
                  </div>
                </>
              )}
            </div>
          </section>
        ))}

        <section className="border-t border-line-strong py-[72px]">
          <h2 className="t-h1 mb-8">Every session includes</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED.map((item) => (
              <div key={item.title} className="grid content-start gap-2">
                <item.icon className="size-[22px]" aria-hidden="true" />
                <b>{item.title}</b>
                <span className="t-muted">{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ClosingCall
        title={
          <>
            Pick a mode.
            <br />
            Start the clock.
          </>
        }
      />
    </>
  );
}
