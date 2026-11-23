export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading admin"
      className="grid animate-pulse gap-6"
    >
      <span className="sr-only">Loading admin…</span>
      <div className="h-10 w-72 rounded-md bg-surface-sunk" />
      <div className="h-28 rounded-lg bg-surface-sunk" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-80 rounded-lg bg-surface-sunk lg:col-span-8" />
        <div className="h-80 rounded-lg bg-surface-sunk lg:col-span-4" />
      </div>
    </div>
  );
}
