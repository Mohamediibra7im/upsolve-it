export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="mx-auto min-h-[70vh] max-w-5xl space-y-8 px-5 py-16 sm:px-8 sm:py-20">
      <span className="sr-only">Loading page…</span>
      <div className="space-y-5 motion-safe:animate-pulse" aria-hidden="true">
        <div className="h-3 w-28 rounded-full bg-[#2b3031]" />
        <div className="h-12 w-3/4 max-w-lg rounded-xl bg-[#2b3031]" />
        <div className="h-5 w-2/3 rounded-lg bg-[#242929]" />
        <div className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="h-56 rounded-2xl border border-[#2b3031] bg-[#191c1e]" />
          <div className="h-56 rounded-2xl border border-[#2b3031] bg-[#191c1e]" />
        </div>
      </div>
    </div>
  );
}
