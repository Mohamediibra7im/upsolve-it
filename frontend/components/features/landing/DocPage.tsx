import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const READING = [
  ["/how-it-works", "How it works"],
  ["/modes", "The five modes"],
  ["/faq", "FAQ"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
];

/** The reading template for privacy, terms, FAQ and about:
 *  a title, a numbered index on the left, a 720px text column and,
 *  on wide screens, a side column with the other pages and the sign-up action. */
export default function DocPage({
  path,
  eyebrow,
  title,
  lead,
  sections,
}: {
  /** This page's own path, left out of the reading list. */
  path: string;
  eyebrow: string;
  title: string;
  lead?: string;
  sections: { id: string; title: string; body: ReactNode }[];
}) {
  const number = (i: number) => String(i + 1).padStart(2, "0");
  return (
    <div className="wrap">
      <header className="mb-12 border-b border-line-strong pb-12 pt-16">
        <p className="t-eyebrow">{eyebrow}</p>
        <h1 className="t-d2 mt-4">{title}</h1>
        {lead && <p className="t-lg t-muted mt-5 max-w-[720px]">{lead}</p>}
      </header>
      <div className="grid gap-x-6 gap-y-10 pb-[88px] lg:grid-cols-12">
        <nav
          aria-label="On this page"
          className="grid content-start gap-0.5 lg:sticky lg:top-24 lg:col-span-3 lg:self-start"
        >
          {sections.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex gap-3 rounded-md px-3 py-2.5 font-semibold text-ink-muted hover:bg-surface-sunk hover:text-ink"
            >
              <span className="t-num">{number(i)}</span>
              {section.title}
            </a>
          ))}
        </nav>
        <article className="grid max-w-[720px] gap-10 lg:col-span-9 xl:col-span-6">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id}>
              <h2 className="t-h1 mb-3">
                {number(i)} {section.title}
              </h2>
              <div className="grid gap-4 text-[17px] leading-7 text-ink-muted">
                {section.body}
              </div>
            </section>
          ))}
        </article>
        <aside className="grid content-start gap-6 sm:grid-cols-2 lg:col-span-9 lg:col-start-4 xl:sticky xl:top-24 xl:col-span-3 xl:col-start-auto xl:grid-cols-1 xl:self-start">
          <nav aria-label="More to read" className="u-panel">
            <div className="u-panel__head">
              <h2 className="t-h3">More to read</h2>
            </div>
            <div className="grid gap-0.5 p-2">
              {READING.filter(([href]) => href !== path).map(
                ([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 font-semibold text-ink-muted hover:bg-surface-sunk hover:text-ink"
                  >
                    {label}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                ),
              )}
            </div>
          </nav>
          <section className="u-inverse grid content-between gap-6 rounded-lg p-6">
            <div className="grid gap-2">
              <p className="t-eyebrow">Free to use</p>
              <h2 className="t-h1">Your next solve is waiting.</h2>
              <p className="text-ink-muted">
                Timed sets built around your rating, and a queue that keeps what
                you missed.
              </p>
            </div>
            <Link
              href="/signup"
              className="u-btn u-btn--primary justify-self-start"
            >
              Start practicing <ArrowUpRight aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
