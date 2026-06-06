export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse max-w-7xl">
      <div className="h-10 w-56 rounded-2xl bg-muted/40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-[1.5rem] bg-muted/30" />
        ))}
      </div>
      <div className="h-96 w-full rounded-[2rem] bg-muted/20" />
    </div>
  );
}
