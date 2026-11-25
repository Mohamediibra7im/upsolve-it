import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Picker } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpsolvedProblems } from "@/hooks/data";
import { averageEffectiveProblemRatingForSession } from "@/services/training/effectiveProblemRating";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import type { Training } from "@/types/Training";
import type { TrainingProblem } from "@/types/TrainingProblem";

const PAGE_SIZES = [5, 10, 25, 50];

const sessionMinutes = (t: Training) =>
  t.durationMinutes ||
  (t.startTime && t.endTime
    ? Math.round((t.endTime - t.startTime) / 60000)
    : null);

function ProblemLink({
  problem,
  startTime,
  upsolved,
}: {
  problem: TrainingProblem;
  startTime: number;
  upsolved: boolean;
}) {
  const solved = isTrainingProblemCountedSolved(problem);
  const minutes =
    solved && problem.solvedTime
      ? Math.floor((problem.solvedTime - startTime) / 60000)
      : null;
  const state = solved
    ? "Solved in the session"
    : upsolved
      ? "Upsolved after the session"
      : "Not solved";

  return (
    <a
      href={problem.url}
      target="_blank"
      rel="noreferrer"
      title={state}
      className="t-num t-sm inline-flex items-center gap-1 whitespace-nowrap hover:underline"
    >
      {solved ? (
        <Check className="size-3.5 text-solved" aria-hidden="true" />
      ) : (
        upsolved && (
          <RotateCcw className="size-3.5 text-pending" aria-hidden="true" />
        )
      )}
      {problem.contestId}-{problem.index}
      {minutes !== null && <span className="t-muted">{minutes}m</span>}
      <span className="sr-only">({state})</span>
    </a>
  );
}

/** The sessions table. Pass `deleteTraining` to offer deleting a session. */
export default function History({
  history,
  deleteTraining,
  isDeleting,
}: {
  history: Training[];
  deleteTraining?: (trainingId: string) => void;
  isDeleting?: string | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const { upsolvedProblems } = useUpsolvedProblems();

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const rows = history.slice((page - 1) * pageSize, page * pageSize);

  const wasUpsolved = (p: TrainingProblem) =>
    !!upsolvedProblems.find(
      (u) => u.contestId === p.contestId && u.index === p.index,
    )?.solvedTime;

  const pager = [
    { label: "First page", Icon: ChevronsLeft, to: 1, off: page === 1 },
    {
      label: "Previous page",
      Icon: ChevronLeft,
      to: page - 1,
      off: page === 1,
    },
    {
      label: "Next page",
      Icon: ChevronRight,
      to: page + 1,
      off: page === totalPages,
    },
    {
      label: "Last page",
      Icon: ChevronsRight,
      to: totalPages,
      off: page === totalPages,
    },
  ];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="u-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Date</th>
              <th>Problems</th>
              <th className="num">Solved</th>
              <th className="num">Time</th>
              <th className="num">Performance</th>
              <th>State</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((training) => {
              const problems = training.problems ?? [];
              const solved = problems.filter(
                isTrainingProblemCountedSolved,
              ).length;
              const minutes = sessionMinutes(training);
              const mode = formatTrainingModeLabel(
                normalizeTrainingMode(training.trainingMode),
              );
              const started = new Date(training.startTime);
              const date = started.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr key={training._id ?? training.startTime}>
                  <td>
                    <b>{mode}</b>
                    {problems.length > 0 && (
                      <>
                        <br />
                        <span className="t-sm t-muted whitespace-nowrap">
                          Average rating{" "}
                          <span className="t-num">
                            {Math.round(
                              averageEffectiveProblemRatingForSession(training),
                            )}
                          </span>
                        </span>
                      </>
                    )}
                  </td>
                  <td
                    className="whitespace-nowrap"
                    title={started.toLocaleString()}
                  >
                    {date}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {problems.map((p) => (
                        <ProblemLink
                          key={`${p.contestId}-${p.index}`}
                          problem={p}
                          startTime={training.startTime}
                          upsolved={wasUpsolved(p)}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="num">
                    {solved}/{problems.length}
                  </td>
                  <td className="num">
                    {minutes === null ? "—" : `${minutes}m`}
                  </td>
                  <td className="num">{training.performance}</td>
                  <td>
                    {solved === problems.length ? (
                      <Badge variant="solved">
                        <Check />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="pending">
                        <RotateCcw />
                        Needs upsolving
                      </Badge>
                    )}
                  </td>
                  <td>
                    {training._id && (
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/training/session/${training._id}/review`}
                          className="u-btn u-btn--sm"
                          aria-label={`Open the review of the ${mode} session from ${date}`}
                        >
                          Open review
                        </Link>
                        {deleteTraining && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="u-btn--sm"
                            aria-label={`Delete the ${mode} session from ${date}`}
                            disabled={isDeleting === training._id}
                            onClick={() => setToDelete(training._id!)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {history.length > PAGE_SIZES[0] && (
        <div className="u-panel__foot">
          <div className="flex items-center gap-2">
            Rows per page
            <Picker
              aria-label="Rows per page"
              className="t-num h-8 w-20 text-ink"
              value={String(pageSize)}
              onChange={(size) => {
                setPageSize(Number(size));
                setCurrentPage(1);
              }}
              options={PAGE_SIZES.map((size) => ({
                value: String(size),
                label: size,
              }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="t-num mr-2">
              Page {page} of {totalPages}
            </span>
            {pager.map(({ label, Icon, to, off }) => (
              <Button
                key={label}
                variant="outline"
                size="icon"
                className="u-btn--sm"
                aria-label={label}
                disabled={off}
                onClick={() => setCurrentPage(to)}
              >
                <Icon />
              </Button>
            ))}
          </div>
        </div>
      )}

      {deleteTraining && (
        <Dialog
          open={toDelete !== null}
          onOpenChange={(open) => !open && setToDelete(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="t-h2">Delete this session?</DialogTitle>
              <DialogDescription className="t-muted">
                It leaves your history for good, and its numbers leave your
                statistics.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setToDelete(null)}>
                Keep session
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (toDelete) deleteTraining(toDelete);
                  setToDelete(null);
                }}
              >
                <Trash2 />
                Delete session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
