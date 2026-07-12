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
  ladder: "LADDER.EXE",
  speed: "SPEED.COM",
  contest: "CONTEST.BAT",
  weakness: "WEAKNESS.SYS",
  endurance: "ENDURE.BAT",
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
        <span className="text-emerald-400 font-bold" title={`Solved in ${solvedMinutes}m`}>
          [✓ {solvedMinutes}M]
        </span>
      );
    }

    if (isTrainingProblemCountedSolved(problem)) {
      return (
        <span className="text-emerald-400 font-bold">
          [✓]
        </span>
      );
    }

    if (postSolvedTime) {
      return (
        <span className="text-amber-400 font-bold" title="Upsolved after session">
          [+]
        </span>
      );
    }

    return (
      <span className="text-emerald-500/20">
        [ ]
      </span>
    );
  };

  return (
    <Link
      className="hover:text-emerald-300 transition-colors font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
      href={problem.url}
      target="_blank"
    >
      {renderStatus()}
      <span className="text-[10px] text-emerald-500/50 hover:text-emerald-300">
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
    if (confirm("Are you sure you want to purge this session run database record?")) {
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
      <div className="text-center py-8 text-emerald-500/25 font-mono text-xs">
        [SYS.ERR // NO TRAINING SESSION LOGS FOUND]
      </div>
    );
  }

  // Count max problems in any session in the current view
  const maxProblemsCount = Math.max(...paginatedHistory.map((h) => h.problems?.length ?? 0), 0);

  return (
    <div className="font-mono text-emerald-400 w-full space-y-4">
      {/* Desktop Grid Layout */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-[800px] divide-y divide-emerald-500/[0.07]">
          {/* Header row */}
          <div className="grid grid-flow-col auto-cols-fr items-center px-2 py-2.5 text-[8px] font-bold uppercase tracking-widest text-emerald-500/25 border-b border-emerald-500/10">
            <span>TIMESTAMP</span>
            <span>RUN_BINARY</span>
            <span>AVG.RATING</span>
            {Array.from({ length: maxProblemsCount }).map((_, idx) => (
              <span key={idx}>P{String(idx + 1).padStart(2, "0")}</span>
            ))}
            <span>PERF.SCORE</span>
            <span className="text-right pr-2">PURGE</span>
          </div>

          {/* Data rows */}
          {paginatedHistory.map((training) => {
            const mode = normalizeTrainingMode(training.trainingMode);
            const modeLabel = modeToExe[mode] ?? formatTrainingModeLabel(mode).toUpperCase();

            return (
              <div
                key={training._id ?? training.startTime}
                className="grid grid-flow-col auto-cols-fr items-center px-2 py-3 hover:bg-emerald-950/5 transition-all duration-200"
              >
                {/* Date */}
                <span className="text-[10px] text-emerald-500/40 tabular-nums">
                  {new Date(training.startTime).toLocaleDateString()}
                </span>

                {/* Mode executable */}
                <span className="text-[10px] font-bold text-emerald-400">
                  {modeLabel}
                </span>

                {/* Avg Rating */}
                <span className="text-[10px] text-emerald-500/40 tabular-nums">
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
                        <span className="text-emerald-500/10">—</span>
                      )}
                    </div>
                  );
                })}

                {/* Performance */}
                <span className="text-[10px] font-bold text-emerald-300 tabular-nums">
                  {training.performance}
                </span>

                {/* Action */}
                <div className="flex items-center justify-end pr-2">
                  <button
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                    className="flex items-center justify-center size-7 rounded text-emerald-500/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
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
      <div className="md:hidden space-y-4 divide-y divide-emerald-500/[0.07]">
        {paginatedHistory.map((training) => {
          const mode = normalizeTrainingMode(training.trainingMode);
          const modeLabel = modeToExe[mode] ?? formatTrainingModeLabel(mode).toUpperCase();

          return (
            <div
              key={training._id ?? training.startTime}
              className="pt-4 first:pt-0 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {modeLabel}
                  </span>
                  <div className="text-[9px] text-emerald-500/30 tabular-nums mt-0.5">
                    {new Date(training.startTime).toLocaleDateString()} · AVG: {calculateAverageRating(training)} · PERF: {training.performance}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(training._id!)}
                  disabled={isDeleting === training._id}
                  className="flex items-center justify-center size-7 rounded text-emerald-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Problems horizontal scrolling or grid */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 py-1">
                {training.problems.map((p, idx) => (
                  <div key={p.contestId} className="flex items-center gap-1">
                    <span className="text-[9px] text-emerald-500/25">P{idx + 1}:</span>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-500/10">
          {/* Rows per page selector */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/30">ROWS_PER_PAGE:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 px-2 rounded border border-emerald-500/20 bg-transparent text-[10px] font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/40 appearance-none cursor-pointer font-mono"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={String(size)} className="bg-[#060a08] text-emerald-400">
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/30 mr-2 tabular-nums">
              PAGE {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-7 rounded border border-emerald-500/15 text-emerald-500/40 hover:text-emerald-300 hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft size={12} />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-7 rounded border border-emerald-500/15 text-emerald-500/40 hover:text-emerald-300 hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-7 rounded border border-emerald-500/15 text-emerald-500/40 hover:text-emerald-300 hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={12} />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-7 rounded border border-emerald-500/15 text-emerald-500/40 hover:text-emerald-300 hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
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
