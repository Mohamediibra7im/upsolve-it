'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAdminLogs } from '@/hooks/admin/useAdminLogs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { m, AnimatePresence } from 'framer-motion';

export default function AdminLogsView() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [handleFilter, setHandleFilter] = useState('');

  const { logs, total, isLoading, isError } = useAdminLogs({
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
    if (action.includes('CREATE')) return 'text-emerald-450';
    if (action.includes('UPDATE')) return 'text-sky-400';
    if (action.includes('DELETE')) return 'text-red-400';
    if (action.includes('SYNC')) return 'text-indigo-400';
    if (action.includes('ROLE')) return 'text-amber-450';
    if (action.includes('FRIEND')) return 'text-pink-400';
    if (action.includes('CANCEL')) return 'text-yellow-500';
    if (action.includes('SENT')) return 'text-cyan-400';
    return 'text-emerald-500/60';
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'User': return <User size={10} />;
      case 'NOTIFICATION': return <Info size={10} />;
      case 'TRAINING': return <Activity size={10} />;
      default: return <Tag size={10} />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-emerald-400">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">AUDIT_TRAIL_SYNCHRONIZING.SYS...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="rounded-none border border-red-500/25 bg-red-955/10 p-12 text-center font-mono text-red-400 max-w-xl mx-auto">
          <div className="size-12 bg-red-955/20 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-400" size={20} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest">CONNECTION_ERROR</h3>
          <p className="text-[10px] text-red-500/50 uppercase mt-1.5 mb-6 max-w-xs mx-auto">We couldn&apos;t retrieve the audit registry records.</p>
          <Button onClick={() => globalThis.location.reload()} variant="outline" className="rounded-none border-red-500/20 hover:bg-red-500/10 text-red-400 font-mono text-[9px] uppercase tracking-widest h-8">
            Retry Connection
          </Button>
        </Card>
      );
    }

    if (logs.length === 0) {
      return (
        <Card className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-16 text-center font-mono text-emerald-500/40">
          <div className="h-10 w-10 bg-emerald-950/15 border border-emerald-500/15 flex items-center justify-center mx-auto mb-3">
            <Database className="text-emerald-500/20 animate-pulse" size={20} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest">[ NO_AUDIT_LOGS_FOUND ]</h3>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden lg:block relative border border-emerald-500/15 rounded-none overflow-hidden bg-[#060a08]/10 shadow-2xl">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-b border-emerald-500/15 hover:bg-transparent">
                <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 w-[170px]">TIMESTAMP</TableHead>
                <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 w-[180px]">PERFORMED_BY</TableHead>
                <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 w-[190px]">ACTION_TYPE</TableHead>
                <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">LOGS_TELEMETRY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              <AnimatePresence mode="popLayout">
                {logs.map((log, idx) => (
                  <TableRow
                    key={log._id}
                    className="hover:bg-emerald-500/[0.02] border-b border-emerald-500/[0.08]"
                  >
                    {/* Timestamp */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-emerald-500/35 shrink-0" />
                        <div className="text-[9px] font-bold text-emerald-500/60 whitespace-nowrap uppercase">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          <span className="mx-1.5 text-emerald-500/20">/</span>
                          {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}
                        </div>
                      </div>
                    </TableCell>

                    {/* Performed By */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-none border border-emerald-500/20 bg-emerald-950/10 overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <Image src={log.performedBy.avatar} alt={log.performedByHandle} width={24} height={24} unoptimized className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-emerald-500/30 bg-background">
                              <User size={10} />
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-300 truncate max-w-[120px] tracking-wide">{log.performedByHandle}</div>
                      </div>
                    </TableCell>

                    {/* Action & Entity */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider", getActionColor(log.action))}>
                          [{log.action}]
                        </span>
                        <div className="flex items-center gap-1.5 text-emerald-500/35">
                          {getEntityIcon(log.entity)}
                          <span className="text-[8px] font-bold uppercase tracking-widest">{log.entity}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(log.details || {}).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-1 text-[9px]">
                            <span className="text-emerald-500/30 uppercase text-[8px] font-bold tracking-wider shrink-0">{k}:</span>
                            <span className="text-emerald-400 font-bold break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
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
            {logs.map((log, idx) => (
              <m.div
                key={log._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className="bg-[#060a08]/30 border-emerald-500/15 rounded-none overflow-hidden shadow-md">
                  <div className="p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-none border border-emerald-500/20 bg-emerald-950/10 overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <Image src={log.performedBy.avatar} alt={log.performedByHandle} width={28} height={28} unoptimized className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-emerald-500/30 bg-background">
                              <User size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-emerald-300">{log.performedByHandle}</div>
                          <div className="text-[8px] text-emerald-500/35 font-bold uppercase mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            {' · '}
                            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500/35">
                        {getEntityIcon(log.entity)}
                        <span className="text-[8px] font-bold uppercase tracking-widest">{log.entity}</span>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <span className={cn("inline-block text-[8px] font-bold uppercase tracking-wider", getActionColor(log.action))}>
                      [{log.action}]
                    </span>

                    {/* Details */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="p-3 rounded-none bg-[#040604]/50 border border-emerald-500/10 space-y-1.5">
                        {Object.entries(log.details).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-1.5 text-[9px]">
                            <span className="text-emerald-500/30 uppercase text-[8px] font-bold shrink-0">{k}:</span>
                            <span className="text-emerald-450 font-bold break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
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
    <div className="space-y-8 font-mono text-emerald-400">
      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" />
          <Input 
            placeholder="SEARCH_PERFORMED_BY..." 
            className="pl-10 h-9 bg-[#040604]/50 border-emerald-500/15 rounded-none text-xs text-emerald-300 placeholder:text-emerald-500/20 focus:ring-0 focus:border-emerald-500/45 font-mono"
            value={handleFilter}
            onChange={(e) => { setHandleFilter(e.target.value); setPage(0); }}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" />
          <Input 
            placeholder="FILTER_ACTION_TYPE..." 
            className="pl-10 h-9 bg-[#040604]/50 border-emerald-500/15 rounded-none text-xs text-emerald-300 placeholder:text-emerald-500/20 focus:ring-0 focus:border-emerald-500/45 font-mono"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          />
        </div>
        <div className="relative group">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" />
          <Input 
            placeholder="FILTER_ENTITY_NODE..." 
            className="pl-10 h-9 bg-[#040604]/50 border-emerald-500/15 rounded-none text-xs text-emerald-300 placeholder:text-emerald-500/20 focus:ring-0 focus:border-emerald-500/45 font-mono"
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Logs Interface */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-none bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45">Security Audit telemetry</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-500/35 uppercase tracking-widest">
            {total} Total Events Logged
          </div>
        </div>
        {renderContent()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border border-emerald-500/15 bg-[#060a08]/30 rounded-none">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(0); }}>
              <SelectTrigger className="h-8 w-16 bg-[#040604]/50 border-emerald-500/15 rounded-none text-[9px] font-bold text-emerald-400 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#060a08] border-emerald-500/25 rounded-none font-mono">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-[9px] font-bold text-emerald-400">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Info & Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mr-2">
              Page {page + 1} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(0)}
              disabled={page === 0 || isLoading}
              className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
            >
              <ChevronsLeft size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0 || isLoading}
              className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
            >
              <ChevronLeft size={12} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
            >
              <ChevronRight size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
            >
              <ChevronsRight size={12} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
