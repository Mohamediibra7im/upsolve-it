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
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 font-sans text-foreground">
      {/* Desktop: Table-style header */}
      <div className="hidden lg:grid grid-cols-[40px_1fr_80px_100px_60px] items-center px-2 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        <span>#</span>
        <span>Problem</span>
        <span className="text-center">Rating</span>
        <span className="text-center">Status</span>
        <span className="text-right">Actions</span>
      </div>

      {/* Problem rows */}
      <div className="divide-y divide-border">
        {paginatedProblems.map((problem, idx) => {
          const index = startIndex + idx;
          const isSolved = !!problem.solvedTime;

          return (
            <div
              key={problem.contestId + problem.index}
              className={cn(
                "group grid grid-cols-[24px_minmax(0,1fr)_auto] lg:grid-cols-[40px_1fr_80px_100px_60px] items-center gap-3 lg:gap-0 py-3 px-2 hover:bg-card transition-all duration-200",
                isSolved && "text-foreground"
              )}
            >
              {/* Index */}
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Problem name + ID */}
              <Link
                href={problem.url}
                target="_blank"
                className="group/link flex items-center gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate group-hover/link:text-primary transition-colors">
                      {problem.name}
                    </span>
                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-60 transition-opacity shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {problem.contestId}-{problem.index}
                  </span>
                </div>
              </Link>

              {/* Rating (desktop) */}
              <div className="hidden lg:flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {problem.rating || "—"}
                </span>
              </div>

              {/* Status (desktop) */}
              <div className="hidden lg:flex items-center justify-center">
                {isSolved ? (
                  <span className="text-xs font-medium text-primary">Solved</span>
                ) : (
                  <span className="text-xs font-medium text-amber-400">Pending</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                {/* Mobile status */}
                <span className="lg:hidden text-xs font-medium mr-1">
                  {isSolved ? (
                    <span className="text-primary">✓</span>
                  ) : (
                    <span className="text-amber-400">…</span>
                  )}
                </span>
                {/* Mobile rating */}
                <span className="lg:hidden hidden sm:inline text-xs text-muted-foreground tabular-nums mr-2">
                  {problem.rating || "—"}
                </span>
                <button
                  onClick={() => onDelete(problem)}
                  aria-label={`Remove ${problem.name} from upsolve list`}
                  className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Rows per page:</span>
            <select aria-label="Problems per page"
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="h-11 px-2 rounded-lg border border-border bg-transparent text-xs font-medium text-primary focus:outline-none focus:border-border appearance-none cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={String(size)} className="bg-card text-primary">
                  {size}
                </option>
              ))}
            </select>
          </div>

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

export default UpsolvedProblemsList;
