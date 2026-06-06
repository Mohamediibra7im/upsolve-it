export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-16 w-full border-b border-border/30 bg-background/60" />
      <div className="container mx-auto px-4 py-20 space-y-8 max-w-5xl">
        <div className="h-12 w-2/3 rounded-2xl bg-muted/30 mx-auto" />
        <div className="h-6 w-1/2 rounded-xl bg-muted/20 mx-auto" />
        <div className="h-48 w-full rounded-[2rem] bg-muted/20" />
      </div>
    </div>
  );
}
