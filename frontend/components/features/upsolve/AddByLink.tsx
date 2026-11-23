"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/Toast";
import type { UpsolveProblem } from "@/types/UpsolveProblem";

/** The first line of the queue: paste a problem link, and it joins the queue. */
export default function AddByLink({
  onAdd,
}: {
  onAdd: (url: string) => Promise<UpsolveProblem>;
}) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const problem = await onAdd(url.trim());
      setUrl("");
      toast({
        title: "Added to your queue",
        description: problem.name,
        variant: "success",
      });
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "The problem was not added. Try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-2 rounded-lg border border-dashed border-line-strong px-5 py-2.5 focus-within:border-solid focus-within:border-[var(--focus)] max-sm:px-4"
    >
      <div className="flex items-center gap-3">
        <Plus className="size-4 flex-none text-ink-muted" aria-hidden="true" />
        <label htmlFor="add-by-link" className="sr-only">
          Link of a problem to add to your queue
        </label>
        <input
          id="add-by-link"
          className="h-10 min-w-0 flex-1 bg-transparent placeholder:text-ink-muted focus-visible:outline-none"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          maxLength={300}
          placeholder="Paste a problem link to add it"
          value={url}
          aria-invalid={!!error}
          aria-describedby={error ? "add-by-link-error" : undefined}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={busy || !url.trim()}
        >
          {busy && (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {busy ? "Adding…" : "Add"}
        </Button>
      </div>
      {error && (
        <p id="add-by-link-error" role="alert" className="u-error t-sm pb-1">
          {error}
        </p>
      )}
    </form>
  );
}
