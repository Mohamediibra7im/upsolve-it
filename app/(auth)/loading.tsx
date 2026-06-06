export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 px-4 animate-pulse">
        <div className="h-8 w-32 rounded-xl bg-muted/40 mx-auto" />
        <div className="h-[400px] w-full rounded-[2rem] bg-muted/30" />
      </div>
    </div>
  );
}
