import type { ReactNode } from "react";
import DocPage from "@/components/features/landing/DocPage";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/about");

const REPO = "https://github.com/Mohamediibra7im/upsolve-it";

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="t-link">
      {children}
    </a>
  );
}

const SECTIONS = [
  {
    id: "why",
    title: "Why it exists",
    body: (
      <>
        <p>
          Most rating growth in competitive programming happens after the timer
          stops, when you go back to the problems you could not solve. That part
          is easy to skip.
        </p>
        <p>
          Upsolve It gives it a shape: timed problem sets built around your
          rating, one queue for everything you missed, and a record of the work
          you put in. It works with Codeforces today, and it is built so other
          platforms can follow.
        </p>
      </>
    ),
  },
  {
    id: "who",
    title: "Who builds it",
    body: (
      <p>
        Upsolve It is built under the{" "}
        <Out href="https://hnuicpc.tech">HNU - FCSIT ICPC Community</Out> by{" "}
        <Out href="https://mohamediibrahim.dev/">Mohamed Ibrahim</Out>, for the
        competitive programming community.
      </p>
    ),
  },
  {
    id: "free-and-open",
    title: "Free, and built in the open",
    body: (
      <p>
        Upsolve It is free to use. The code for the site and the API is public
        in one repository on GitHub:{" "}
        <Out href={REPO}>Mohamediibra7im/upsolve-it</Out>.
      </p>
    ),
  },
  {
    id: "report-a-bug",
    title: "Report a bug",
    body: (
      <p>
        <Out href={`${REPO}/issues`}>Open an issue on GitHub</Out>. Say what you
        did, what you expected and what happened instead. Ideas for improvements
        are welcome in the same place.
      </p>
    ),
  },
  {
    id: "contribute",
    title: "Contribute",
    body: (
      <p>
        Fork the repository, create a branch from{" "}
        <code className="t-num">main</code>, make your change and run the checks
        listed in the README. Then open a pull request against{" "}
        <code className="t-num">main</code>.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <DocPage
      eyebrow="About"
      title="Made by people who love a good problem."
      sections={SECTIONS}
    />
  );
}
