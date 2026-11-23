export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="grid animate-pulse gap-6"
    >
      <span className="sr-only">Loading page…</span>
      <div className="h-10 w-72 rounded-md bg-surface-sunk" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-64 rounded-lg bg-surface-sunk lg:col-span-7" />
        <div className="h-64 rounded-lg bg-surface-sunk lg:col-span-5" />
      </div>
      <div className="h-28 rounded-lg bg-surface-sunk" />
    </div>
  );
}
