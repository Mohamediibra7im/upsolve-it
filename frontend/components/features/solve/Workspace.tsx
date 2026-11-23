"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  ListChecks,
  Play,
  Plus,
  RotateCcw,
  SquareTerminal,
  X,
} from "lucide-react";
import "katex/dist/katex.min.css";
import "./workspace.css";
import { useToast } from "@/components/providers/Toast";
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
  showTags,
  onProblemOpen,
}: {
  /** The session's name, shown beside the problem switcher. */
  title: string;
  problems: TrainingProblem[];
  statuses: SubmissionStatus[];
  /** Contest mode: ratings and topics stay hidden. */
  hideDetails: boolean;
  showTags: boolean;
  onProblemOpen: (problem: TrainingProblem) => void;
}) {
  const { toast } = useToast();
  const [selected, setSelected] = useState(0);
  const problem = problems[Math.min(selected, problems.length - 1)];
  const id = idOf(problem);

  // Showing a problem is opening it: the session times it from here.
  const opened = useRef(new Set<string>());
  useEffect(() => {
    if (opened.current.has(id)) return;
    opened.current.add(id);
    onProblemOpen(problem);
    // `problem` changes identity on every status refresh; its id is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onProblemOpen]);

  const { statement, error, isLoading, retry } = useStatement(problem);
  const { code, setCode, language, setLanguage, reset } = useDraft(problem);
  const { run, running } = useRunner();

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

  const submit = async () => {
    let copied = true;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      copied = false;
    }
    window.open(problem.url, "_blank", "noopener,noreferrer");
    toast({
      title: copied ? "Code copied" : "Copy your code first",
      description: copied
        ? `Paste it on ${judgeName(problem)} and submit there. Then refresh the status here.`
        : `The browser did not allow copying. Copy the code yourself, then submit it on ${judgeName(problem)}.`,
      variant: copied ? "success" : "warning",
    });
  };

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
      <div className="sw-running" style={{ display: "flex" }} role="status">
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
        <div className="sw-cases" role="group" aria-label="Results by case">
          {outcomes.map((o, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === shown}
              onClick={() => setOpenResult(i)}
            >
              <i className={o === "pass" || o === "ran" ? "ok" : "bad"} />
              Case {i + 1}
              <span className="sr-only">
                {o === "pass" ? ", passed" : o === "ran" ? ", ran" : ", failed"}
              </span>
            </button>
          ))}
        </div>
        <div data-caseview>
          <span className="sw-label">Input</span>
          <div className="sw-field">
            <pre>{shownCase.input || " "}</pre>
          </div>
          <span className="sw-label">Your output</span>
          <div
            className={
              outcomes[shown] === "wrong" ? "sw-field bad" : "sw-field"
            }
          >
            <pre>{result.output || " "}</pre>
          </div>
          {shownCase.expected !== undefined && (
            <>
              <span className="sw-label">Expected</span>
              <div className="sw-field">
                <pre>{shownCase.expected}</pre>
              </div>
            </>
          )}
          {result.error && (
            <>
              <span className="sw-label">
                {result.status === "ok" ? "Error stream" : "Error"}
              </span>
              <div className="sw-field err">
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

  return (
    <div className="sw">
      <div className="sw-top">
        <div className="sw-top__side">
          <span className="sw-ghost">
            <ListChecks aria-hidden="true" />
            {title}
          </span>
          <span
            className="sw-probs"
            role="group"
            aria-label="Problems of this session"
          >
            {problems.map((p, i) => {
              const status = statuses.find(
                (s) => s.problemId === idOf(p),
              )?.status;
              const solved = status === "AC" || Boolean(p.solvedTime);
              return (
                <button
                  key={idOf(p)}
                  type="button"
                  aria-pressed={i === selected}
                  data-state={
                    solved ? "ok" : status === "WA" ? "bad" : undefined
                  }
                  title={`Problem ${letter(i)}${solved ? ", accepted" : status === "WA" ? ", wrong answer" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  {solved && i !== selected ? (
                    <Check aria-hidden="true" />
                  ) : (
                    letter(i)
                  )}
                  <span className="sr-only">
                    {solved
                      ? " accepted"
                      : status === "WA"
                        ? " wrong answer"
                        : ""}
                  </span>
                </button>
              );
            })}
          </span>
        </div>
        <div className="sw-top__mid">
          <button
            type="button"
            className="sw-run"
            onClick={runCode}
            disabled={running}
          >
            <Play aria-hidden="true" fill="currentColor" />
            {running ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            className="sw-submit"
            onClick={submit}
            title={`Copies your code and opens the problem on ${judgeName(problem)}, where you submit it`}
          >
            <ArrowUp aria-hidden="true" />
            Submit
          </button>
        </div>
        <div className="sw-top__side sw-top__side--end">
          <span className="sw-name">{statement?.title ?? problem.name}</span>
          <a
            className="sw-ghost sw-ghost--line"
            href={problem.url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink aria-hidden="true" />
            {judgeName(problem)}
          </a>
        </div>
      </div>

      <div className="sw-grid">
        <section className="sw-panel" aria-label="Problem">
          <div className="sw-tabs">
            <span className="sw-tabs__title">
              <FileText aria-hidden="true" />
              Description
            </span>
          </div>
          <div className="sw-body">
            <h2 className="sw-title">
              {letter(selected)}. {statement?.title ?? problem.name}
            </h2>
            <div className="sw-meta">
              {!hideDetails && !!problem.rating && (
                <span className="sw-pill sw-pill--mid">
                  {problem.judge === "atcoder" && "≈ "}
                  {problem.rating}
                </span>
              )}
              <span className="sw-pill">
                {judgeName(problem)}{" "}
                {problem.judge === "atcoder"
                  ? String(problem.contestId).toUpperCase()
                  : problem.contestId}
              </span>
              {statement?.timeLimit && (
                <span className="sw-pill">{statement.timeLimit}</span>
              )}
              {statement?.memoryLimit && (
                <span className="sw-pill">{statement.memoryLimit}</span>
              )}
              {showTags &&
                !hideDetails &&
                (problem.tags ?? []).map((tag) => (
                  <span key={tag} className="sw-pill">
                    {tag}
                  </span>
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
                <i />
              </div>
            ) : error || !statement ? (
              <div className="sw-prose" role="alert">
                <p>
                  The problem could not be loaded here. You can still write and
                  run code against your own input.
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
                {part("story").map((s, i) => (
                  <Prose key={`story-${i}`} html={s.html} />
                ))}
                {part("input").map((s, i) => (
                  <div key={`in-${i}`} className="sw-ex">
                    <b>Input</b>
                    <Prose html={s.html} />
                  </div>
                ))}
                {part("output").map((s, i) => (
                  <div key={`out-${i}`} className="sw-ex">
                    <b>Output</b>
                    <Prose html={s.html} />
                  </div>
                ))}
                {part("other").map((s, i) => (
                  <div key={`other-${i}`} className="sw-ex">
                    <b>{s.title}</b>
                    <Prose html={s.html} />
                  </div>
                ))}
                {samples.map((s, i) => (
                  <div key={`ex-${i}`} className="sw-ex">
                    <b>Example {i + 1}</b>
                    <div className="sw-ex__body">
                      <div>
                        <span>Input</span>
                        <pre>{s.input}</pre>
                      </div>
                      <div>
                        <span>Output</span>
                        <pre>{s.expected}</pre>
                      </div>
                      {s.note && (
                        <div>
                          <span>Explanation</span>
                          <Prose html={s.note} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {part("constraints").map((s, i) => (
                  <div key={`con-${i}`} className="sw-ex">
                    <b>Constraints</b>
                    <Prose html={s.html} />
                  </div>
                ))}
                {part("note").map((s, i) => (
                  <div key={`note-${i}`} className="sw-ex">
                    <b>Note</b>
                    <Prose html={s.html} />
                  </div>
                ))}
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
          <section className="sw-panel sw-panel--code" aria-label="Code">
            <div className="sw-tabs">
              <span className="sw-tabs__title">
                <Code2 aria-hidden="true" />
                Code
              </span>
            </div>
            <div className="sw-bar">
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
              <span className="sw-bar__end">
                <span>Saved on this device</span>
                <button
                  type="button"
                  className="sw-icon"
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
              <span>Escape, then Tab, leaves the editor</span>
              <span>Ctrl + Enter runs</span>
            </div>
          </section>

          <section className="sw-panel sw-panel--io" aria-label="Test cases">
            <div className="sw-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={pane === "case"}
                onClick={() => setPane("case")}
              >
                <ListChecks aria-hidden="true" />
                Testcase
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pane === "result"}
                onClick={() => setPane("result")}
              >
                <SquareTerminal aria-hidden="true" />
                Test Result
              </button>
            </div>
            {pane === "case" ? (
              <div className="sw-body">
                <div className="sw-cases" role="group" aria-label="Test cases">
                  {cases.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={i === shownInput}
                      onClick={() => setOpenCase(i)}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sw-add"
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
                </div>
                {cases.length === 0 ? (
                  <p className="sw-empty">
                    No sample cases yet. Add a case of your own with the plus.
                  </p>
                ) : isAdded ? (
                  <div data-caseview>
                    <label className="sw-label" htmlFor="sw-own-input">
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
                      className="sw-link"
                      style={{ justifySelf: "start" }}
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
                      <X
                        aria-hidden="true"
                        style={{ display: "inline", verticalAlign: "-2px" }}
                      />{" "}
                      Remove this case
                    </button>
                  </div>
                ) : (
                  <div data-caseview>
                    <span className="sw-label">Input</span>
                    <div className="sw-field">
                      <pre>{cases[shownInput].input}</pre>
                    </div>
                    <span className="sw-label">Expected output</span>
                    <div className="sw-field">
                      <pre>{cases[shownInput].expected}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="sw-body">{resultView}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
