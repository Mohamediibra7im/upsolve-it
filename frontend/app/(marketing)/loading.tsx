export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="wrap grid animate-pulse gap-6 py-[72px]"
    >
      <span className="sr-only">Loading page…</span>
      <div className="h-4 w-40 rounded-sm bg-surface-sunk" />
      <div className="h-20 w-3/4 max-w-3xl rounded-md bg-surface-sunk" />
      <div className="h-6 w-1/2 rounded-sm bg-surface-sunk" />
      <div className="mt-8 h-72 rounded-lg bg-surface-sunk" />
    </div>
  );
}
