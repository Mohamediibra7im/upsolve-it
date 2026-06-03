"use client";

import { useState } from "react";
import { TrainingProblem } from "@/types/TrainingProblem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  CheckCircle2,
  ExternalLink,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const getDifficultyColor = (rating: number) => {
  if (rating >= 2400) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  if (rating >= 2100) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (rating >= 1900) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  if (rating >= 1600) return "bg-sky-500/10 text-sky-500 border-sky-500/20";
  if (rating >= 1400) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (rating >= 1200) return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  return "bg-muted/10 text-muted-foreground border-muted/20";
};

const UpsolvedProblemsList = ({
  upsolvedProblems,
  onDelete,
}: {
  upsolvedProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Pagination calculations
  const totalItems = upsolvedProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProblems = upsolvedProblems.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block w-full">
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent bg-muted/20">
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Problem Details
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Difficulty
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Status
                  </TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {paginatedProblems.map((problem, idx) => {
                  const index = startIndex + idx;
                  return (
                    <TableRow
                      key={problem.contestId + problem.index}
                      className="border-border/40 hover:bg-primary/5 transition-all duration-300 group"
                    >
                      <TableCell className="py-6 px-8">
                        <Link
                          className="flex items-center gap-4 group/link"
                          href={problem.url}
                          target="_blank"
                        >
                          <div className="flex-shrink-0 size-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/20 transition-transform group-hover/link:scale-110">
                            {index + 1}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground group-hover/link:text-primary transition-colors truncate">
                                {problem.name}
                              </span>
                              <ExternalLink className="size-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
                            </div>
                            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                              {problem.contestId}-{problem.index}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", getDifficultyColor(problem.rating || 0))}
                        >
                          {problem.rating || "Unrated"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {problem.solvedTime ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Conquered</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit">
                            <Clock className="size-3.5 text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">In Queue</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(problem)}
                          className="size-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/40 transition-all"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden relative space-y-4">
        {paginatedProblems.map((problem, idx) => {
          const index = startIndex + idx;
          return (
            <Card
              key={problem.contestId + problem.index}
              className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden rounded-[1.5rem] shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/20">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Problem {index + 1}</div>
                      <Badge
                        variant="outline"
                        className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", getDifficultyColor(problem.rating || 0))}
                      >
                        {problem.rating || "Unrated"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(problem)}
                    className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/40"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <Link
                  className="group block space-y-3"
                  href={problem.url}
                  target="_blank"
                >
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/20 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {problem.name}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>

                <div className="flex items-center justify-between pt-2">
                  {problem.solvedTime ? (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Conquered</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Clock className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">In Queue</span>
                    </div>
                  )}
                  
                  <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    {problem.contestId}-{problem.index}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                {[10, 20, 50, 100].map((size) => (
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

export default UpsolvedProblemsList;







