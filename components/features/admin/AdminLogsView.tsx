"use client";

import { AdminState, AdminRetry } from "./AdminState";

import { useState } from "react";
import Image from "next/image";
import { useAdminLogs } from "@/hooks/admin/useAdminLogs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Database,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Shield,
  Tag,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";

export default function AdminLogsView() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [handleFilter, setHandleFilter] = useState("");

  const { logs, total, isLoading, isError, mutate } = useAdminLogs({
    limit: pageSize,
    offset: page * pageSize,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
    performedByHandle: handleFilter || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (p: number) => {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "text-[#b5e3c4]";
    if (action.includes("UPDATE")) return "text-sky-400";
    if (action.includes("DELETE")) return "text-red-400";
    if (action.includes("SYNC")) return "text-indigo-400";
    if (action.includes("ROLE")) return "text-amber-400";
    if (action.includes("FRIEND")) return "text-pink-400";
    if (action.includes("CANCEL")) return "text-yellow-500";
    if (action.includes("SENT")) return "text-cyan-400";
    return "text-[#929b98]";
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "User":
        return <User size={10} />;
      case "NOTIFICATION":
        return <Info size={10} />;
      case "TRAINING":
        return <Activity size={10} />;
      default:
        return <Tag size={10} />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <AdminState
          tone="loading"
          title="Loading activity…"
          description="Gathering the latest workspace changes."
        />
      );
    }

    if (isError) {
      return (
        <AdminState
          tone="error"
          title="Could not load activity"
          description="The activity history is temporarily unavailable."
          action={<AdminRetry onRetry={() => mutate()} />}
        />
      );
    }

    if (logs.length === 0) {
      return (
        <AdminState
          icon={Database}
          title="No activity to show"
          description="Workspace changes will appear here. If you are using filters, try a broader search."
        />
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden lg:block relative border border-[#2b3031] rounded-xl overflow-hidden bg-[#191c1e] shadow-none">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-b border-[#2b3031] hover:bg-transparent">
                <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98] w-[170px]">
                  Date
                </TableHead>
                <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98] w-[180px]">
                  Member
                </TableHead>
                <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98] w-[190px]">
                  Action
                </TableHead>
                <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98]">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              <AnimatePresence mode="popLayout">
                {logs.map((log, _idx) => (
                  <TableRow
                    key={log._id}
                    className="hover:bg-[#b5e3c4]/[0.06] border-b border-[#2b3031]"
                  >
                    {/* Timestamp */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-[#929b98] shrink-0" />
                        <div className="text-xs font-medium text-[#929b98] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                          <span className="mx-1.5 text-[#929b98]">/</span>
                          {new Date(log.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </TableCell>

                    {/* Performed By */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-xl border border-[#2b3031] bg-[#131715] overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <Image
                              src={log.performedBy.avatar}
                              alt={log.performedByHandle}
                              width={24}
                              height={24}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#929b98] bg-background">
                              <User size={10} />
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-medium text-[#f1f3ee] truncate max-w-[120px]">
                          {log.performedByHandle}
                        </div>
                      </div>
                    </TableCell>

                    {/* Action & Entity */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            getActionColor(log.action),
                          )}
                        >
                          {log.action.replaceAll("_", " ").toLowerCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[#929b98]">
                          {getEntityIcon(log.entity)}
                          <span className="text-xs font-medium">
                            {log.entity}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(log.details || {}).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-baseline gap-1 text-xs"
                          >
                            <span className="text-[#929b98] text-xs font-medium shrink-0">
                              {k}:
                            </span>
                            <span className="text-[#b5e3c4] font-medium break-all">
                              {typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden relative space-y-3">
          <AnimatePresence mode="popLayout">
            {logs.map((log, _idx) => (
              <m.div
                key={log._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: _idx * 0.02 }}
              >
                <Card className="bg-[#191c1e] border-[#2b3031] rounded-[20px] overflow-hidden shadow-none">
                  <div className="p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl border border-[#2b3031] bg-[#131715] overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <Image
                              src={log.performedBy.avatar}
                              alt={log.performedByHandle}
                              width={28}
                              height={28}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#929b98] bg-background">
                              <User size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#f1f3ee]">
                            {log.performedByHandle}
                          </div>
                          <div className="text-xs text-[#929b98] font-medium mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                            {" · "}
                            {new Date(log.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#929b98]">
                        {getEntityIcon(log.entity)}
                        <span className="text-xs font-medium">
                          {log.entity}
                        </span>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <span
                      className={cn(
                        "inline-block text-xs font-medium",
                        getActionColor(log.action),
                      )}
                    >
                      {log.action.replaceAll("_", " ").toLowerCase()}
                    </span>

                    {/* Details */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="p-3 rounded-xl bg-[#101214] border border-[#2b3031] space-y-1.5">
                        {Object.entries(log.details).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-baseline gap-1.5 text-xs"
                          >
                            <span className="text-[#929b98] text-xs font-medium shrink-0">
                              {k}:
                            </span>
                            <span className="text-[#b5e3c4] font-medium break-all">
                              {typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      <div>
        <h2 className="font-heading text-2xl font-medium tracking-[-0.04em]">
          Activity log
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#929b98]">
          Review changes across your community and training content.
        </p>
      </div>
      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#929b98] group-focus-within:text-[#b5e3c4] transition-colors" />
          <Input
            placeholder="Search by member…"
            className="pl-10 h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[13px] text-[#f1f3ee] placeholder:text-[#929b98] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
            value={handleFilter}
            onChange={(e) => {
              setHandleFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#929b98] group-focus-within:text-[#b5e3c4] transition-colors" />
          <Input
            placeholder="Filter by action…"
            className="pl-10 h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[13px] text-[#f1f3ee] placeholder:text-[#929b98] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="relative group">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#929b98] group-focus-within:text-[#b5e3c4] transition-colors" />
          <Input
            placeholder="Filter by area…"
            className="pl-10 h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[13px] text-[#f1f3ee] placeholder:text-[#929b98] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Logs Interface */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-xl bg-[#b5e3c4]" />
            <span className="text-xs font-medium text-[#929b98]">
              Recent activity
            </span>
          </div>
          <div className="text-xs font-medium text-[#929b98]">
            {total} Total Events Logged
          </div>
        </div>
        {renderContent()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border border-[#2b3031] bg-[#191c1e] rounded-xl">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#929b98]">
              Rows per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-10 w-16 bg-[#101214] border-[#2b3031] rounded-xl text-xs font-medium text-[#b5e3c4] focus:ring-2 focus:ring-[#b5e3c4]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#191c1e] border-[#2b3031] rounded-xl font-sans">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="text-xs font-medium text-[#b5e3c4]"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Info & Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#929b98] mr-2">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(0)}
              disabled={page === 0 || isLoading}
              className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
            >
              <ChevronsLeft size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0 || isLoading}
              className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
            >
              <ChevronLeft size={12} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
            >
              <ChevronRight size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
            >
              <ChevronsRight size={12} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
