export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading your account"
      className="grid min-h-dvh animate-pulse lg:grid-cols-2"
    >
      <span className="sr-only">Loading your account…</span>
      <div className="grid content-center justify-items-center gap-5 px-5 py-16">
        <div className="h-10 w-full max-w-[420px] rounded-md bg-surface-sunk" />
        <div className="h-11 w-full max-w-[420px] rounded-md bg-surface-sunk" />
        <div className="h-11 w-full max-w-[420px] rounded-md bg-surface-sunk" />
        <div className="h-[52px] w-full max-w-[420px] rounded-md bg-surface-sunk" />
      </div>
      <div className="hidden bg-surface-sunk lg:block" />
    </div>
  );
}
