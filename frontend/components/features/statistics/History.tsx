import { useState } from "react";
import Link from "next/link";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { useUpsolvedProblems } from "@/hooks/data";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import { averageEffectiveProblemRatingForSession } from "@/services/training/effectiveProblemRating";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";

const modeToExe: Record<string, string> = {
  ladder: "Ladder",
  speed: "Speed",
  contest: "Contest",
  weakness: "Weakness",
  endurance: "Endurance",
};

const ProblemStatus = ({
  problem,
  startTime,
  postSolvedTime,
}: {
  problem: TrainingProblem;
  startTime: number;
  postSolvedTime: number | null;
}) => {
  const renderStatus = () => {
    if (isTrainingProblemCountedSolved(problem) && problem.solvedTime) {
      const solvedMinutes = Math.floor((problem.solvedTime - startTime) / 60000);
      return (
        <span className="text-primary font-medium" title={`Solved in ${solvedMinutes}m`}>
          ✓  {solvedMinutes}min
        </span>
      );
    }

    if (isTrainingProblemCountedSolved(problem)) {
      return (
        <span className="text-primary font-medium">
          ✓
        </span>
      );
    }

    if (postSolvedTime) {
      return (
        <span className="text-amber-400 font-medium" title="Upsolved after session">
          +
        </span>
      );
    }

    return (
      <span className="text-muted-foreground">

      </span>
    );
  };

  return (
    <Link
      className="hover:text-foreground transition-colors font-medium text-xs flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={problem.url}
      target="_blank"
    >
      {renderStatus()}
      <span className="text-xs text-muted-foreground hover:text-foreground">
        {problem.contestId}-{problem.index}
      </span>
    </Link>
  );
};

const History = ({
  history,
  deleteTraining,
  isDeleting,
}: {
  history: Training[];
  deleteTraining: (trainingId: string) => void;
  isDeleting: string | null;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { upsolvedProblems } = useUpsolvedProblems();

  // Pagination calculations
  const totalItems = history.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedHistory = history.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const findPostSolvedTime = (p: TrainingProblem): number | null => {
    const found = upsolvedProblems?.find(
      (u) => u.contestId === p.contestId && u.index === p.index,
    );
    return found?.solvedTime ?? null;
  };

  const onDelete = (trainingId: string) => {
    if (confirm("Delete this training session from your history?")) {
      deleteTraining(trainingId);
    }
  };

  const calculateAverageRating = (training: Training) => {
    if (!training.problems?.length) return "—";
    const avg = averageEffectiveProblemRatingForSession(training);
    if (!Number.isFinite(avg)) return "—";
    return Math.round(avg);
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-sans text-xs">
        No training sessions yet
      </div>
    );
  }

  // Count max problems in any session in the current view
  const maxProblemsCount = Math.max(...paginatedHistory.map((h) => h.problems?.length ?? 0), 0);
  const gridTemplateColumns = `120px 100px 90px ${maxProblemsCount > 0 ? `repeat(${maxProblemsCount}, minmax(70px, 1fr))` : ""} 110px 48px`;

  return (
    <div className="font-sans text-primary w-full space-y-4">
      {/* Desktop Grid Layout */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-[800px] divide-y divide-border">
          {/* Header row */}
          <div style={{ gridTemplateColumns }} className="grid grid-flow-col items-center px-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border">
            <span>Date</span>
            <span>Session</span>
            <span>Avg. rating</span>
            {Array.from({ length: maxProblemsCount }).map((_, idx) => (
              <span key={idx}>P{String(idx + 1).padStart(2, "0")}</span>
            ))}
            <span>Performance</span>
            <span className="text-right pr-2">Delete</span>
          </div>

          {/* Data rows */}
          {paginatedHistory.map((training) => {
            const mode = normalizeTrainingMode(training.trainingMode);
            const modeLabel = modeToExe[mode] ?? formatTrainingModeLabel(mode);

            return (
              <div
                key={training._id ?? training.startTime}
                style={{ gridTemplateColumns }}
                className="grid grid-flow-col items-center px-2 py-3 hover:bg-card transition-all duration-200"
              >
                {/* Date */}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(training.startTime).toLocaleDateString()}
                </span>

                {/* Mode executable */}
                <span className="text-xs font-medium text-primary">
                  {modeLabel}
                </span>

                {/* Avg Rating */}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {calculateAverageRating(training)}
                </span>

                {/* Problems */}
                {Array.from({ length: maxProblemsCount }).map((_, idx) => {
                  const p = training.problems?.[idx];
                  return (
                    <div key={idx}>
                      {p ? (
                        <ProblemStatus
                          problem={p}
                          startTime={training.startTime}
                          postSolvedTime={findPostSolvedTime(p)}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}

                {/* Performance */}
                <span className="text-xs font-medium text-foreground tabular-nums">
                  {training.performance}
                </span>

                {/* Action */}
                <div className="flex items-center justify-end pr-2">
                  <button
                    aria-label="Delete training session"
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                    className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Card-less List Layout */}
      <div className="md:hidden space-y-4 divide-y divide-border">
        {paginatedHistory.map((training) => {
          const mode = normalizeTrainingMode(training.trainingMode);
          const modeLabel = modeToExe[mode] ?? formatTrainingModeLabel(mode);

          return (
            <div
              key={training._id ?? training.startTime}
              className="pt-4 first:pt-0 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-primary">
                    {modeLabel}
                  </span>
                  <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    {new Date(training.startTime).toLocaleDateString()} · Average: {calculateAverageRating(training)} · Performance: {training.performance}
                  </div>
                </div>

                <button
                  aria-label="Delete training session"
                    onClick={() => onDelete(training._id!)}
                  disabled={isDeleting === training._id}
                  className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Problems horizontal scrolling or grid */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 py-1">
                {training.problems.map((p, idx) => (
                  <div key={p.contestId} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">P{idx + 1}:</span>
                    <ProblemStatus
                      problem={p}
                      startTime={training.startTime}
                      postSolvedTime={findPostSolvedTime(p)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          {/* Rows per page selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Rows per page:</span>
            <select aria-label="Sessions per page"
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="h-11 px-2 rounded-lg border border-border bg-transparent text-xs font-medium text-primary focus:outline-none focus:border-border appearance-none cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={String(size)} className="bg-card text-primary">
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2 tabular-nums">
              Page {currentPage}/{totalPages}
            </span>

            <button
              aria-label="First page"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronsLeft size={12} />
            </button>
            <button
              aria-label="Previous page"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              aria-label="Next page"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronRight size={12} />
            </button>
            <button
              aria-label="Last page"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ChevronsRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
