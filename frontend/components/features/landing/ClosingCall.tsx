import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** The volt band that ends a public page with the sign-up action. */
export default function ClosingCall({ title }: { title: ReactNode }) {
  return (
    <section className="u-inverse">
      <div className="wrap grid items-end gap-x-12 gap-y-8 py-16 lg:grid-cols-[1fr_auto] lg:py-24">
        <div className="grid gap-5">
          <p className="t-eyebrow">Free to use · Made for the climb</p>
          <h2 className="t-d2">{title}</h2>
        </div>
        <div className="grid justify-items-start gap-3 lg:justify-items-end">
          <Link href="/signup" className="u-btn u-btn--primary u-btn--lg">
            Start practicing for free <ArrowUpRight aria-hidden="true" />
          </Link>
          <span className="t-sm text-ink-muted">
            Sign up with your Codeforces handle.
          </span>
        </div>
      </div>
    </section>
  );
}
