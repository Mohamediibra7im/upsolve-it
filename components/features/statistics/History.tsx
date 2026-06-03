import { useState } from "react";
import Link from "next/link";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {useUpsolvedProblems} from "@/hooks/data";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import { averageEffectiveProblemRatingForSession } from "@/services/training/effectiveProblemRating";
import { CheckCircle2, XCircle, BadgeCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";

const Problem = ({
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
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-500">
          <CheckCircle2 className="size-4" />
          <span>{solvedMinutes}m</span>
        </span>
      );
    }

    if (isTrainingProblemCountedSolved(problem)) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-500">
          <CheckCircle2 className="size-4" />
          <span>Solved</span>
        </span>
      );
    }

    if (postSolvedTime) {
      return (
        <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-500" title="Upsolved after session">
          <BadgeCheck className="size-4" />
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-500">
        <XCircle className="size-4" />
      </span>
    );
  };

  return (
    <Link
      className="text-primary hover:underline duration-300 font-medium text-sm flex items-center gap-1 whitespace-nowrap"
      href={problem.url}
      target="_blank"
    >
      <span className="text-base">{renderStatus()}</span>
      <span className="truncate">
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
    if (confirm("Are you sure you want to delete this practice session?")) {
      deleteTraining(trainingId);
    }
  };

  const calculateAverageRating = (training: Training) => {
    if (!training.problems?.length) return "-";
    const avg = averageEffectiveProblemRatingForSession(training);
    if (!Number.isFinite(avg)) return "-";
    return Math.round(avg);
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No training history found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Avg Rating</TableHead>
              {history[0].problems.map((p, index) => (
                <TableHead key={`${p.contestId}-${p.index}`}>P{index + 1}</TableHead>
              ))}
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {paginatedHistory.map((training) => (
              <TableRow key={training._id ?? training.startTime}>
                <TableCell>
                  {new Date(training.startTime).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {formatTrainingModeLabel(
                      normalizeTrainingMode(training.trainingMode),
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{calculateAverageRating(training)}</TableCell>
                {training.problems.map((p) => (
                  <TableCell key={p.contestId}>
                    <Problem
                      problem={p}
                      startTime={training.startTime}
                      postSolvedTime={findPostSolvedTime(p)}
                    />
                  </TableCell>
                ))}
                <TableCell>{training.performance}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden relative space-y-4">
        {paginatedHistory.map((training) => (
          <Card
            key={training._id ?? training.startTime}
            className="shadow-sm border-border/60 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-4">
                {/* Header with date and delete button */}
                <div className="flex justify-between items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      {new Date(training.startTime).toLocaleDateString("en-US", {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
                      {formatTrainingModeLabel(
                      normalizeTrainingMode(training.trainingMode),
                    )}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(training._id!)}
                    disabled={isDeleting === training._id}
                    className="flex-shrink-0 size-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Stats section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Avg Rating:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {calculateAverageRating(training)}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-muted-foreground/60">
                    •
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Performance:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {training.performance}
                    </span>
                  </div>
                </div>

                {/* Problems section */}
                <div className="pt-2 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {training.problems.map((p, index) => (
                      <div
                        key={p.contestId}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-muted-foreground min-w-[2rem]">
                          P{index + 1}:
                        </span>
                        <div className="flex-1 min-w-0">
                          <Problem
                            problem={p}
                            startTime={training.startTime}
                            postSolvedTime={findPostSolvedTime(p)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/20 bg-muted/5 mt-4 rounded-3xl">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 w-20 bg-background/50 border-border/40 rounded-xl text-xs font-bold focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40 rounded-xl">
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs font-bold">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Info & Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="size-9 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary disabled:opacity-30"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-9 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-9 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="size-9 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary disabled:opacity-30"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default History;







