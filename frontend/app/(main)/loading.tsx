export default function Loading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 max-w-7xl space-y-6 animate-pulse">
      <div className="h-10 w-48 rounded-2xl bg-muted/40" />
      <div className="h-32 w-full rounded-[2rem] bg-muted/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[1.5rem] bg-muted/30" />
        ))}
      </div>
      <div className="h-64 w-full rounded-[2rem] bg-muted/20" />
    </div>
  );
}
