export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading your account"
      className="flex min-h-screen items-center justify-center bg-[#101214] px-5 py-8 sm:px-8"
    >
      <span className="sr-only">Loading your account…</span>
      <div className="w-full max-w-[1000px] space-y-8 motion-safe:animate-pulse">
        <div className="h-8 w-36 rounded-lg bg-[#262d29]" />
        <div className="grid overflow-hidden rounded-[24px] border border-[#2b3031] bg-[#191c1e] lg:grid-cols-12">
          <div className="space-y-5 border-b border-[#2b3031] bg-[#1d2420] p-6 sm:p-8 lg:p-10 lg:col-span-5 lg:min-h-[36rem] lg:border-b-0 lg:border-r">
            <div className="hidden size-12 rounded-2xl bg-[#303c33] lg:block" />
            <div className="h-9 w-4/5 rounded-lg bg-[#303c33]" />
            <div className="h-4 w-full rounded bg-[#303c33]" />
            <div className="h-4 w-2/3 rounded bg-[#303c33]" />
          </div>
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:col-span-7 lg:p-12">
            <div className="h-7 w-3/4 rounded-lg bg-[#2b3031]" />
            {[0, 1].map((field) => (
              <div key={field} className="space-y-3">
                <div className="h-3 w-24 rounded bg-[#2b3031]" />
                <div className="h-12 rounded-xl bg-[#252b27]" />
              </div>
            ))}
            <div className="h-12 rounded-xl bg-[#34473a]" />
            <div className="mx-auto h-3 w-3/4 rounded bg-[#2b3031]" />
          </div>
        </div>
      </div>
    </div>
  );
}
