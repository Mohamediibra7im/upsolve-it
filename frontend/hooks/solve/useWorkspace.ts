import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";
import {
  STARTER,
  isLanguage,
  type LanguageId,
} from "@/services/solve/languages";
import type { TrainingProblem } from "@/types/TrainingProblem";

/** A part of a statement, as GET /api/problems/statement gives it. */
export type StatementSection = {
  kind: "story" | "constraints" | "input" | "output" | "note" | "other";
  title?: string;
  /** Cleaned by the server. Formulas are still TeX. */
  html: string;
};
export type Statement = {
  title: string;
  timeLimit: string;
  memoryLimit: string;
  sections: StatementSection[];
  samples: { input: string; output: string; note?: string }[];
  sourceUrl: string;
};

/** One run of the code on one input, as POST /api/run gives it. */
export type RunResult = {
  status: "ok" | "error" | "time-limit" | "memory-limit" | "crashed";
  output: string;
  error: string;
  exitCode: number | null;
  timeMs: number | null;
  memoryKb: number | null;
  truncated: boolean;
};

type ProblemRef = Pick<TrainingProblem, "judge" | "contestId" | "index">;
const idOf = (p: ProblemRef) =>
  `${p.judge ?? "codeforces"}:${p.contestId}:${p.index}`;

/**
 * A problem's statement and samples. Read once per visit: it does not change.
 * With `tryKey`, a visitor's read of one of the fixed problems of /try.
 */
export function useStatement(problem: ProblemRef | null, tryKey?: string) {
  const query = problem
    ? new URLSearchParams({
        judge: problem.judge ?? "codeforces",
        contestId: String(problem.contestId),
        index: problem.index,
      })
    : null;
  const { data, error, isLoading, mutate } = useSWR<Statement>(
    tryKey
      ? `/api/run/try/statement?problem=${encodeURIComponent(tryKey)}`
      : query
        ? `/api/problems/statement?${query}`
        : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 3_600_000,
    },
  );
  return { statement: data, error, isLoading, retry: () => mutate() };
}

const LANGUAGE_KEY = "solve-language";
const draftKey = (problem: ProblemRef, language: LanguageId) =>
  `solve-draft:${idOf(problem)}:${language}`;
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // a full or blocked store only costs the draft its memory
  }
};

/**
 * The code being written for a problem, kept in this browser per problem and
 * per language, and the language last used. A draft is stored a moment after
 * the typing stops, and at once when the problem or the language changes.
 */
export function useDraft(problem: ProblemRef) {
  const [language, setLanguageState] = useState<LanguageId>(() => {
    const stored = typeof window === "undefined" ? null : read(LANGUAGE_KEY);
    return isLanguage(stored) ? stored : "cpp17";
  });
  const key = draftKey(problem, language);
  const [code, setCodeState] = useState(
    () =>
      (typeof window === "undefined" ? null : read(key)) ?? STARTER[language],
  );
  const pending = useRef<{ key: string; code: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (pending.current) write(pending.current.key, pending.current.code);
    pending.current = null;
  }, []);

  // another problem or language: store what was typed, open that one's draft
  const shown = useRef(key);
  useEffect(() => {
    if (shown.current === key) return;
    flush();
    shown.current = key;
    setCodeState(read(key) ?? STARTER[language]);
  }, [key, language, flush]);
  useEffect(() => flush, [flush]);

  const setCode = useCallback(
    (next: string) => {
      setCodeState(next);
      pending.current = { key: shown.current, code: next };
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 400);
    },
    [flush],
  );
  const setLanguage = useCallback((next: LanguageId) => {
    write(LANGUAGE_KEY, next);
    setLanguageState(next);
  }, []);
  const reset = useCallback(
    () => setCode(STARTER[language]),
    [setCode, language],
  );

  return { code, setCode, language, setLanguage, reset };
}

/**
 * Runs code on a list of inputs through the server. One run at a time.
 * With `tryKey`, a visitor's run: the server takes that problem's samples
 * from its own copy, so no inputs are sent.
 */
export function useRunner(tryKey?: string) {
  const [running, setRunning] = useState(false);
  const run = useCallback(
    async (language: LanguageId, code: string, inputs: string[]) => {
      setRunning(true);
      try {
        const { results } = await apiFetcher<{ results: RunResult[] }>(
          tryKey ? "/api/run/try" : "/api/run",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              tryKey
                ? { problem: tryKey, language, code }
                : { language, code, inputs },
            ),
          },
        );
        return results;
      } finally {
        setRunning(false);
      }
    },
    [tryKey],
  );
  return { run, running };
}
