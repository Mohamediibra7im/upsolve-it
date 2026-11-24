"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Check,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  ListChecks,
  Play,
  Plus,
  RotateCcw,
  SquareTerminal,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./workspace.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rankKey } from "@/utils/rank";
import {
  useDraft,
  useRunner,
  useStatement,
  type RunResult,
} from "@/hooks/solve/useWorkspace";
import type { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import { sameOutput } from "@/services/solve/compareOutput";
import { LANGUAGES, type LanguageId } from "@/services/solve/languages";
import { renderStatementMath } from "@/services/solve/statementMath";
import { submitUrl } from "@/services/solve/submitUrl";
import type { TrainingProblem } from "@/types/TrainingProblem";
import CodeEditor from "./CodeEditor";

const letter = (i: number) =>
  i < 26 ? String.fromCharCode(65 + i) : `${i + 1}`;
const idOf = (p: TrainingProblem) => `${p.contestId}_${p.index}`;
const judgeName = (p: TrainingProblem) =>
  p.judge === "atcoder" ? "AtCoder" : "Codeforces";

type Case = { input: string; expected?: string; note?: string };
/** How one case ended: the run's own status, or how its output compares. */
type Outcome = "pass" | "wrong" | "ran" | RunResult["status"];
const outcomeOf = (c: Case, r: RunResult): Outcome =>
  r.status !== "ok"
    ? r.status
    : c.expected === undefined
      ? "ran"
      : sameOutput(c.expected, r.output)
        ? "pass"
        : "wrong";

const HEADLINE: Record<Exclude<Outcome, "pass" | "ran" | "ok">, string> = {
  error: "Error",
  crashed: "Runtime Error",
  "time-limit": "Time Limit Exceeded",
  "memory-limit": "Memory Limit Exceeded",
  wrong: "Wrong Answer",
};
// what to name first when several cases end differently
const WORST: Outcome[] = [
  "error",
  "crashed",
  "time-limit",
  "memory-limit",
  "wrong",
];

/** A part of the statement: the server cleaned it, the formulas are typeset here. */
function Prose({ html }: { html: string }) {
  const typeset = useMemo(() => renderStatementMath(html), [html]);
  return (
    <div className="sw-prose" dangerouslySetInnerHTML={{ __html: typeset }} />
  );
}

/**
 * The solve workspace of a session: the chosen problem's statement, an editor
 * with a draft per problem and language, and the problem's samples as test
 * cases the code can be run against. Submitting still happens on the judge.
 */
export default function Workspace({
  title,
  problems,
  statuses,
  hideDetails,
  session,
  notice,
  onProblemOpen,
  tryKeys,
  selected: chosen,
  onSelect,
}: {
  /** The session's name, shown beside the problem switcher. */
  title: string;
  problems: TrainingProblem[];
  statuses: SubmissionStatus[];
  /** Contest mode: ratings and topics stay hidden. */
  hideDetails: boolean;
  /** The session's clock and actions, placed at the end of the bar. */
  session?: ReactNode;
  /** A line about this session, shown under the bar. */
  notice?: ReactNode;
  onProblemOpen: (problem: TrainingProblem) => void;
  /**
   * A visitor with no account, on the public /try page: each problem's key at
   * /api/run/try, in the order of `problems`. Code then runs on the samples
   * only, there are no cases of one's own, and an account takes Submit's place.
   */
  tryKeys?: string[];
  /** The open problem, when the page around the workspace chooses it too. */
  selected?: number;
  onSelect?: (index: number) => void;
}) {
  const [own, setOwn] = useState(0);
  const selected = chosen ?? own;
  const setSelected = onSelect ?? setOwn;
  const [showTags, setShowTags] = useState(false);
  const problem = problems[Math.min(selected, problems.length - 1)];
  const id = idOf(problem);
  const tryKey = tryKeys?.[Math.min(selected, problems.length - 1)];
  const guest = tryKeys !== undefined;

  // Showing a problem is opening it: the session times it from here.
  const opened = useRef(new Set<string>());
  useEffect(() => {
    if (opened.current.has(id)) return;
    opened.current.add(id);
    onProblemOpen(problem);
    // `problem` changes identity on every status refresh; its id is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onProblemOpen]);

  const { statement, error, isLoading, retry } = useStatement(problem, tryKey);
  const { code, setCode, language, setLanguage, reset } = useDraft(problem);
  const { run, running } = useRunner(tryKey);

  // cases the user added, and the last run, are kept per problem
  const [added, setAdded] = useState<Record<string, string[]>>({});
  const [runs, setRuns] = useState<
    Record<string, { cases: Case[]; results: RunResult[] } | { failed: string }>
  >({});
  const [pane, setPane] = useState<"case" | "result">("case");
  const [openCase, setOpenCase] = useState(0);
  const [openResult, setOpenResult] = useState(0);
  useEffect(() => {
    setPane("case");
    setOpenCase(0);
  }, [id]);

  const samples: Case[] = useMemo(
    () =>
      (statement?.samples ?? []).map((s) => ({
        input: s.input,
        expected: s.output,
        note: s.note,
      })),
    [statement],
  );
  const cases: Case[] = [
    ...samples,
    ...(added[id] ?? []).map((input) => ({ input })),
  ];
  const lastRun = runs[id];

  const runCode = async () => {
    if (running || !code.trim()) return;
    // a visitor's code runs on the samples the server holds, or not at all
    if (guest && !samples.length) return;
    // with no case at all, the code still runs once, on empty input
    const toRun = cases.length ? cases : [{ input: "" }];
    setPane("result");
    try {
      const results = await run(
        language,
        code,
        toRun.map((c) => c.input),
      );
      setRuns((all) => ({ ...all, [id]: { cases: toRun, results } }));
      const firstBad = results.findIndex(
        (r, i) => !["pass", "ran"].includes(outcomeOf(toRun[i], r)),
      );
      setOpenResult(Math.max(firstBad, 0));
    } catch (err) {
      setRuns((all) => ({
        ...all,
        [id]: {
          failed:
            err instanceof Error && err.message
              ? err.message
              : "The code did not run. Try again in a moment.",
        },
      }));
    }
  };

  // Submit copies the code, then stops to say so: the judge's page opens in
  // another tab, where a message shown here would never be seen. The page is
  // opened from the dialog, once the user knows a paste is theirs to do.
  const [submitStep, setSubmitStep] = useState<{ copied: boolean } | null>(
    null,
  );
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      return false;
    }
  };
  const submit = async () => setSubmitStep({ copied: await copyCode() });
  const languageName = LANGUAGES.find((l) => l.id === language)?.name;

  const sections = statement?.sections ?? [];
  const part = (kind: string) => sections.filter((s) => s.kind === kind);

  let resultView = (
    <p className="sw-empty">
      Run your code to see how it does on each case. A pass here is a check
      against the samples, not the judge’s verdict.
    </p>
  );
  if (running)
    resultView = (
      <div className="sw-running" role="status">
        <i />
        Running your code on {cases.length || 1}{" "}
        {cases.length > 1 ? "cases" : "case"}…
      </div>
    );
  else if (lastRun && "failed" in lastRun)
    resultView = (
      <div className="sw-done" role="alert">
        <div className="sw-verdict">
          <b data-tone="warn">Not run</b>
          <span>{lastRun.failed}</span>
        </div>
      </div>
    );
  else if (lastRun) {
    const outcomes = lastRun.results.map((r, i) =>
      outcomeOf(lastRun.cases[i], r),
    );
    const worst = WORST.find((o) => outcomes.includes(o));
    const checked = outcomes.filter((o) => o !== "ran").length;
    const passed = outcomes.filter((o) => o === "pass").length;
    const slowest = Math.max(...lastRun.results.map((r) => r.timeMs ?? 0));
    const shown = Math.min(openResult, lastRun.results.length - 1);
    const result = lastRun.results[shown];
    const shownCase = lastRun.cases[shown];
    resultView = (
      <div className="sw-done">
        <div className="sw-verdict" role="status">
          <b data-tone={worst ? undefined : "ok"}>
            {worst
              ? HEADLINE[worst as keyof typeof HEADLINE]
              : checked
                ? "All cases passed"
                : "Finished"}
          </b>
          {checked > 0 && (
            <span>
              {passed} of {checked} {checked === 1 ? "case" : "cases"} passed
            </span>
          )}
          <span className="sw-verdict__time">
            <Clock aria-hidden="true" />
            Runtime {slowest} ms
          </span>
        </div>
        <div className="sw-slots" role="group" aria-label="Results by case">
          {outcomes.map((o, i) => (
            <button
              key={i}
              type="button"
              className="sw-slot"
              aria-pressed={i === shown}
              data-state={o === "pass" || o === "ran" ? "ok" : "bad"}
              data-fill=""
              onClick={() => setOpenResult(i)}
            >
              {i + 1}
              <span className="sr-only">
                {o === "pass"
                  ? ", case passed"
                  : o === "ran"
                    ? ", case ran"
                    : ", case failed"}
              </span>
            </button>
          ))}
        </div>
        <div className="sw-case">
          <span className="u-stat__label">Input</span>
          <div className="sw-field">
            <pre>{shownCase.input || " "}</pre>
          </div>
          <span className="u-stat__label">Your output</span>
          <div
            className="sw-field"
            data-tone={outcomes[shown] === "wrong" ? "bad" : undefined}
          >
            <pre>{result.output || " "}</pre>
          </div>
          {shownCase.expected !== undefined && (
            <>
              <span className="u-stat__label">Expected</span>
              <div className="sw-field">
                <pre>{shownCase.expected}</pre>
              </div>
            </>
          )}
          {result.error && (
            <>
              <span className="u-stat__label">
                {result.status === "ok" ? "Error stream" : "Error"}
              </span>
              <div className="sw-field" data-tone="warn">
                <pre>{result.error}</pre>
              </div>
            </>
          )}
          {result.truncated && (
            <p className="sw-empty">The output was long and has been cut.</p>
          )}
        </div>
      </div>
    );
  }

  const shownInput = Math.min(openCase, Math.max(cases.length - 1, 0));
  const isAdded = shownInput >= samples.length;

  const rank = !hideDetails && problem.rating ? rankKey(problem.rating) : null;

  return (
    <div className="sw">
      <div className="u-panel sw-top">
        <div className="sw-top__side">
          <span className="t-eyebrow">{title}</span>
          <span
            className="sw-slots"
            role="group"
            aria-label="Problems of this session"
          >
            {problems.map((p, i) => {
              const status = statuses.find(
                (st) => st.problemId === idOf(p),
              )?.status;
              const solved = status === "AC" || Boolean(p.solvedTime);
              const state = solved
                ? "accepted"
                : status === "WA"
                  ? "wrong answer"
                  : "";
              return (
                <button
                  key={idOf(p)}
                  type="button"
                  className="sw-slot"
                  aria-pressed={i === selected}
                  data-state={
                    solved ? "ok" : status === "WA" ? "bad" : undefined
                  }
                  title={`Problem ${letter(i)}${state && `, ${state}`}`}
                  onClick={() => setSelected(i)}
                >
                  {solved ? <Check aria-hidden="true" /> : letter(i)}
                  <span className="sr-only">
                    {solved && `Problem ${letter(i)}`}
                    {state && `, ${state}`}
                  </span>
                </button>
              );
            })}
          </span>
          <span className="sw-name">{statement?.title ?? problem.name}</span>
        </div>
        <div className="sw-top__mid">
          <button
            type="button"
            className="u-btn u-btn--primary u-btn--sm"
            onClick={runCode}
            disabled={running || (guest && !samples.length)}
          >
            <Play aria-hidden="true" fill="currentColor" />
            {running ? "Running…" : "Run"}
          </button>
          {guest ? (
            <Link href="/signup" className="u-btn u-btn--sm">
              <UserPlus aria-hidden="true" />
              Create an account
            </Link>
          ) : (
            <button
              type="button"
              className="u-btn u-btn--sm"
              onClick={submit}
              title={`Copies your code, then opens the submit page for this problem on ${judgeName(problem)}`}
            >
              <ArrowUp aria-hidden="true" />
              Submit
            </button>
          )}
        </div>
        <div className="sw-top__side sw-top__side--end">{session}</div>
      </div>
      {notice}

      <div className="sw-grid">
        <section className="u-panel sw-panel" aria-label="Problem">
          <div className="sw-head">
            <span className="sw-tab">
              <FileText aria-hidden="true" />
              Problem
            </span>
            <span className="sw-head__end">
              {!hideDetails && (problem.tags ?? []).length > 0 && (
                <button
                  type="button"
                  className="u-btn u-btn--ghost u-btn--sm"
                  aria-pressed={showTags}
                  onClick={() => setShowTags(!showTags)}
                >
                  {showTags ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                  Topics
                </button>
              )}
              <a
                className="u-btn u-btn--ghost u-btn--sm"
                href={problem.url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink aria-hidden="true" />
                {judgeName(problem)}
              </a>
            </span>
          </div>
          <div className="sw-body">
            <h2 className="sw-title">
              <span className="sw-slot" aria-hidden="true">
                {letter(selected)}
              </span>
              <span>
                <span className="sr-only">Problem {letter(selected)}: </span>
                {statement?.title ?? problem.name}
              </span>
            </h2>
            <div className="sw-meta">
              {rank && (
                <span className="u-rank t-num" data-rank={rank}>
                  {problem.judge === "atcoder" && (
                    <>
                      <span aria-hidden="true">≈</span>
                      <span className="sr-only">about</span>
                    </>
                  )}
                  {problem.rating}
                </span>
              )}
              <Badge variant="line">
                {judgeName(problem)}{" "}
                {problem.judge === "atcoder"
                  ? String(problem.contestId).toUpperCase()
                  : problem.contestId}
              </Badge>
              {statement?.timeLimit && <Badge>{statement.timeLimit}</Badge>}
              {statement?.memoryLimit && <Badge>{statement.memoryLimit}</Badge>}
              {showTags &&
                !hideDetails &&
                (problem.tags ?? []).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
            </div>

            {isLoading ? (
              <div
                className="sw-skel"
                role="status"
                aria-label="Loading the problem"
              >
                <i />
                <i />
                <i />
              </div>
            ) : error || !statement ? (
              <div className="sw-prose" role="alert">
                <p>
                  The problem could not be loaded here.
                  {!guest &&
                    " You can still write your code and run it against input of your own."}
                </p>
                <p>
                  <a href={problem.url} target="_blank" rel="noreferrer">
                    Open it on {judgeName(problem)}
                  </a>{" "}
                  or{" "}
                  <button type="button" className="sw-link" onClick={retry}>
                    try loading it again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                {part("story").length > 0 && (
                  <div className="sw-part">
                    <h3 className="sw-h">Statement</h3>
                    {part("story").map((sec, i) => (
                      <Prose key={i} html={sec.html} />
                    ))}
                  </div>
                )}
                {(
                  [
                    ["input", "Input"],
                    ["output", "Output"],
                    ["other", ""],
                  ] as const
                ).flatMap(([kind, name]) =>
                  part(kind).map((sec, i) => (
                    <div key={`${kind}-${i}`} className="sw-part">
                      <h3 className="sw-h">{name || sec.title}</h3>
                      <Prose html={sec.html} />
                    </div>
                  )),
                )}
                {(
                  [
                    ["constraints", "Constraints"],
                    ["note", "Note"],
                  ] as const
                ).flatMap(([kind, name]) =>
                  part(kind).map((sec, i) => (
                    <div key={`${kind}-${i}`} className="sw-part">
                      <h3 className="sw-h">{name}</h3>
                      <Prose html={sec.html} />
                    </div>
                  )),
                )}
                <p className="sw-src">
                  From {judgeName(problem)}.{" "}
                  <a
                    className="sw-link"
                    href={statement.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open the original
                  </a>
                </p>
              </>
            )}
          </div>
        </section>

        <div className="sw-col">
          <section
            className="u-panel sw-panel sw-panel--code"
            aria-label="Code"
          >
            <div className="sw-head">
              <span className="sw-tab">
                <Code2 aria-hidden="true" />
                Code
              </span>
              <span className="sw-head__end">
                <label className="sr-only" htmlFor="sw-language">
                  Language
                </label>
                <select
                  id="sw-language"
                  className="sw-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageId)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="u-btn u-btn--ghost u-btn--icon u-btn--sm"
                  aria-label="Reset to the starting code"
                  title="Reset to the starting code"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Replace your code with the starting code?",
                      )
                    )
                      reset();
                  }}
                >
                  <RotateCcw aria-hidden="true" />
                </button>
              </span>
            </div>
            <CodeEditor
              className="sw-editor"
              value={code}
              onChange={setCode}
              language={language}
              onRun={runCode}
              label={`Your code for problem ${letter(selected)}`}
            />
            <div className="sw-foot">
              <span>Saved on this device</span>
              <span>
                Ctrl + Enter runs. Escape, then Tab, leaves the editor.
              </span>
            </div>
          </section>

          <section className="u-panel sw-panel" aria-label="Test cases">
            <div className="sw-head" role="tablist">
              <span>
                <button
                  type="button"
                  role="tab"
                  className="sw-tab"
                  style={{ height: "100%" }}
                  aria-selected={pane === "case"}
                  onClick={() => setPane("case")}
                >
                  <ListChecks aria-hidden="true" />
                  Cases
                </button>
                <button
                  type="button"
                  role="tab"
                  className="sw-tab"
                  style={{ height: "100%" }}
                  aria-selected={pane === "result"}
                  onClick={() => setPane("result")}
                >
                  <SquareTerminal aria-hidden="true" />
                  Result
                </button>
              </span>
            </div>
            {pane === "case" ? (
              <div className="sw-body">
                <div className="sw-slots" role="group" aria-label="Test cases">
                  {cases.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="sw-slot"
                      aria-pressed={i === shownInput}
                      onClick={() => setOpenCase(i)}
                    >
                      {i + 1}
                      <span className="sr-only">, case</span>
                    </button>
                  ))}
                  {!guest && (
                    <button
                      type="button"
                      className="sw-slot sw-slot--add"
                      aria-label="Add a case of your own"
                      title="Add a case of your own"
                      onClick={() => {
                        setAdded((all) => ({
                          ...all,
                          [id]: [...(all[id] ?? []), ""],
                        }));
                        setOpenCase(cases.length);
                      }}
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  )}
                </div>
                {cases.length === 0 ? (
                  <p className="sw-empty">
                    No sample cases here.
                    {!guest && " Add a case of your own with the plus."}
                  </p>
                ) : isAdded ? (
                  <div className="sw-case">
                    <label className="u-stat__label" htmlFor="sw-own-input">
                      Your input
                    </label>
                    <textarea
                      id="sw-own-input"
                      className="sw-field"
                      spellCheck={false}
                      placeholder="Type the input your code should read"
                      value={cases[shownInput].input}
                      onChange={(e) =>
                        setAdded((all) => ({
                          ...all,
                          [id]: (all[id] ?? []).map((v, k) =>
                            k === shownInput - samples.length
                              ? e.target.value
                              : v,
                          ),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="u-btn u-btn--ghost u-btn--sm justify-self-start"
                      onClick={() => {
                        setAdded((all) => ({
                          ...all,
                          [id]: (all[id] ?? []).filter(
                            (_, k) => k !== shownInput - samples.length,
                          ),
                        }));
                        setOpenCase(Math.max(shownInput - 1, 0));
                      }}
                    >
                      <X aria-hidden="true" />
                      Remove this case
                    </button>
                  </div>
                ) : (
                  <div className="sw-case">
                    <span className="u-stat__label">Input</span>
                    <div className="sw-field">
                      <pre>{cases[shownInput].input}</pre>
                    </div>
                    <span className="u-stat__label">Expected output</span>
                    <div className="sw-field">
                      <pre>{cases[shownInput].expected}</pre>
                    </div>
                    {/* the judge's explanation of the sample travels with its case */}
                    {cases[shownInput].note && (
                      <>
                        <span className="u-stat__label">Explanation</span>
                        <Prose html={cases[shownInput].note!} />
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="sw-body">{resultView}</div>
            )}
          </section>
        </div>
      </div>

      <Dialog
        open={submitStep !== null}
        onOpenChange={(open) => !open && setSubmitStep(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="t-h2">
              {submitStep?.copied
                ? "Your code is copied"
                : "Copy your code first"}
            </DialogTitle>
            <DialogDescription className="t-muted">
              {submitStep?.copied
                ? `It is on your clipboard. ${judgeName(problem)} only gets it when you paste it there yourself: this site cannot type into another site’s page.`
                : `The browser did not allow copying. Copy your code from the editor yourself, then paste it on ${judgeName(problem)}.`}
            </DialogDescription>
          </DialogHeader>
          <ol className="sw-steps">
            <li>
              <span className="sw-slot" aria-hidden="true">
                1
              </span>
              <span>
                Open the submit page with the button below. This problem is
                already chosen there.
              </span>
            </li>
            <li>
              <span className="sw-slot" aria-hidden="true">
                2
              </span>
              <span>
                Click the source code box and paste: <kbd>Ctrl</kbd> +{" "}
                <kbd>V</kbd>, or <kbd>⌘</kbd> + <kbd>V</kbd> on a Mac.
              </span>
            </li>
            <li>
              <span className="sw-slot" aria-hidden="true">
                3
              </span>
              <span>
                Check that the language is <b>{languageName}</b>, then press the
                judge’s own Submit.
              </span>
            </li>
            <li>
              <span className="sw-slot" aria-hidden="true">
                4
              </span>
              <span>
                Come back here and press the refresh button beside the clock to
                see your result.
              </span>
            </li>
          </ol>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {!submitStep?.copied && (
              <Button
                variant="outline"
                onClick={async () =>
                  setSubmitStep({ copied: await copyCode() })
                }
              >
                Try copying again
              </Button>
            )}
            <Button variant="outline" onClick={() => setSubmitStep(null)}>
              Not now
            </Button>
            <Button
              onClick={() => {
                window.open(
                  submitUrl(problem),
                  "_blank",
                  "noopener,noreferrer",
                );
                setSubmitStep(null);
              }}
            >
              <ExternalLink aria-hidden="true" />
              Open the submit page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
