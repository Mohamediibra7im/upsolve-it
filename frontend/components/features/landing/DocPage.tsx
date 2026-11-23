import type { ReactNode } from "react";

/** The reading template for privacy, terms, FAQ and about:
 *  a title, a numbered index on the left and a 720px text column. */
export default function DocPage({
  eyebrow,
  title,
  lead,
  sections,
}: {
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
        <article className="grid max-w-[720px] gap-10 lg:col-span-9">
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
      </div>
    </div>
  );
}
