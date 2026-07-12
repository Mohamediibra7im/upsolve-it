"use client";

import { useState } from "react";
import { TrainingProblem } from "@/types/TrainingProblem";
import Link from "next/link";
import {
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const UpsolvedProblemsList = ({
  upsolvedProblems,
  onDelete,
}: {
  upsolvedProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const totalItems = upsolvedProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProblems = upsolvedProblems.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="font-mono text-emerald-400">
      {/* Desktop: Table-style header */}
      <div className="hidden lg:grid grid-cols-[40px_1fr_80px_100px_60px] items-center px-2 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-500/30 border-b border-emerald-500/10">
        <span>#</span>
        <span>PROBLEM_NODE</span>
        <span className="text-center">RATING</span>
        <span className="text-center">STATUS</span>
        <span className="text-right">ACT</span>
      </div>

      {/* Problem rows */}
      <div className="divide-y divide-emerald-500/[0.07]">
        {paginatedProblems.map((problem, idx) => {
          const index = startIndex + idx;
          const isSolved = !!problem.solvedTime;

          return (
            <div
              key={problem.contestId + problem.index}
              className={cn(
                "group grid grid-cols-[40px_1fr_auto] lg:grid-cols-[40px_1fr_80px_100px_60px] items-center gap-3 lg:gap-0 py-3 px-2 hover:bg-emerald-950/5 transition-all duration-200",
                isSolved && "text-emerald-300"
              )}
            >
              {/* Index */}
              <span className="text-[10px] font-bold text-emerald-500/40 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Problem name + ID */}
              <Link
                href={problem.url}
                target="_blank"
                className="group/link flex items-center gap-2 min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate group-hover/link:text-emerald-300 transition-colors">
                      {problem.name}
                    </span>
                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-60 transition-opacity shrink-0" />
                  </div>
                  <span className="text-[9px] text-emerald-500/30 uppercase tracking-wider">
                    {problem.contestId}-{problem.index}
                  </span>
                </div>
              </Link>

              {/* Rating (desktop) */}
              <div className="hidden lg:flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-500/50 tabular-nums">
                  {problem.rating || "—"}
                </span>
              </div>

              {/* Status (desktop) */}
              <div className="hidden lg:flex items-center justify-center">
                {isSolved ? (
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">[RESOLVED]</span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">[PENDING]</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                {/* Mobile status */}
                <span className="lg:hidden text-[8px] font-bold uppercase tracking-wider mr-1">
                  {isSolved ? (
                    <span className="text-emerald-400">[✓]</span>
                  ) : (
                    <span className="text-amber-400">[…]</span>
                  )}
                </span>
                {/* Mobile rating */}
                <span className="lg:hidden text-[9px] text-emerald-500/40 tabular-nums mr-2">
                  {problem.rating || "—"}
                </span>
                <button
                  onClick={() => onDelete(problem)}
                  className="flex items-center justify-center size-7 rounded text-emerald-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/30">ROWS_PER_PAGE:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 px-2 rounded border border-emerald-500/20 bg-transparent text-[10px] font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/40 appearance-none cursor-pointer font-mono"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={String(size)} className="bg-[#060a08] text-emerald-400">
                  {size}
                </option>
              ))}
            </select>
          </div>

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

export default UpsolvedProblemsList;
