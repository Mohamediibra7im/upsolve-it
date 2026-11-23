import Link from "next/link";
import Brand from "@/components/layout/Brand";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="wrap grid min-h-dvh content-center justify-items-start gap-5 py-16"
    >
      <Link href="/" aria-label="Upsolve It home">
        <Brand />
      </Link>
      <p className="t-eyebrow mt-10">Error 404 · Page not found</p>
      <h1 className="t-d1">A small detour.</h1>
      <p className="t-lg t-muted max-w-xl">
        This page has moved or does not exist. Head back and pick up your next
        problem.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link href="/" className="u-btn u-btn--primary u-btn--lg">
          Go to home
        </Link>
        <Link href="/faq" className="u-btn u-btn--lg u-btn--ghost">
          Read the FAQ
        </Link>
      </div>
    </main>
  );
}
