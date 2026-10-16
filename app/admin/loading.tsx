export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading admin workspace"
      className="mx-auto max-w-[1400px] space-y-6 motion-safe:animate-pulse"
    >
      <span className="sr-only">Loading admin workspace…</span>
      <div className="h-28 rounded-[20px] border border-[#2b3031] bg-[#191c1e]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-[20px] border border-[#2b3031] bg-[#191c1e]"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="h-80 rounded-[20px] border border-[#2b3031] bg-[#191c1e]" />
        <div className="h-80 rounded-[20px] border border-[#2b3031] bg-[#191c1e]" />
      </div>
    </div>
  );
}
