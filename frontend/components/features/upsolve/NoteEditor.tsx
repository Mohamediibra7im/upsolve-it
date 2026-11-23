"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { UpsolveProblem } from "@/types/UpsolveProblem";

export const NOTE_MAX_LENGTH = 2000;
const SAVE_AFTER_MS = 800;

/** The note of one problem, open under its row. It saves itself as you type. */
export default function NoteEditor({
  id,
  problem,
  onSave,
  onClose,
}: {
  id: string;
  problem: UpsolveProblem;
  onSave: (problem: UpsolveProblem, note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState(problem.note ?? "");
  const [state, setState] = useState<"saved" | "saving" | "error">("saved");
  const stored = useRef((problem.note ?? "").trim());

  const save = useCallback(
    async (value: string) => {
      if (value.trim() === stored.current) return setState("saved");
      setState("saving");
      try {
        await onSave(problem, value);
        stored.current = value.trim();
        setState("saved");
      } catch {
        setState("error");
      }
    },
    [onSave, problem],
  );

  // Keep the latest text and save function at hand for the timers below.
  const latest = useRef({ text, save });
  // Written in an effect because refs must not change during render.
  useEffect(() => {
    latest.current = { text, save };
  });
  useEffect(() => {
    const timer = setTimeout(() => void save(text), SAVE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [text, save]);
  // Closing the note (or leaving the page) must not drop the last words.
  useEffect(() => () => void latest.current.save(latest.current.text), []);

  return (
    <div
      id={id}
      className="grid gap-2 border-b border-line bg-surface-sunk px-5 py-4 last:border-b-0 max-sm:px-4"
    >
      <label className="u-stat__label" htmlFor={`${id}-text`}>
        Your note on {problem.name}
      </label>
      <textarea
        id={`${id}-text`}
        className="u-input"
        rows={3}
        maxLength={NOTE_MAX_LENGTH}
        placeholder="Why did it fail? What was the key idea? Paste the editorial link."
        value={text}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        onBlur={() => void save(text)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={state === "error" ? "u-error t-sm" : "u-hint t-sm"}
          role="status"
        >
          {state === "error"
            ? "Not saved. Check your connection; it will try again as you type."
            : state === "saving"
              ? "Saving…"
              : "Saved"}{" "}
          <span className="t-num">
            · {text.length.toLocaleString("en-US")} of{" "}
            {NOTE_MAX_LENGTH.toLocaleString("en-US")}
          </span>
        </span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
