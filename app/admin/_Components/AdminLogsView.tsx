'use client';

import { useState } from 'react';
import { useAdminLogs } from '@/hooks/admin/useAdminLogs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { motion, AnimatePresence } from 'framer-motion';

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
    if (action.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (action.includes('UPDATE')) return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.includes('SYNC')) return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    if (action.includes('ROLE')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (action.includes('FRIEND')) return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    if (action.includes('CANCEL')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (action.includes('SENT')) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'User': return <User size={14} />;
      case 'NOTIFICATION': return <Info size={14} />;
      case 'TRAINING': return <Activity size={14} />;
      default: return <Tag size={14} />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retrieving activity records...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="border-destructive/20 bg-destructive/5 rounded-2xl p-20 text-center">
          <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-destructive opacity-50" size={32} />
          </div>
          <h3 className="text-xl font-bold text-destructive">Connection Error</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">We couldn't retrieve the audit logs. Please ensure you have the required permissions.</p>
          <Button onClick={() => globalThis.location.reload()} variant="outline" className="rounded-xl border-border hover:bg-secondary/50">
            Retry Connection
          </Button>
        </Card>
      );
    }

    if (logs.length === 0) {
      return (
        <Card className="border-border bg-card/50 rounded-2xl p-20 text-center">
          <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-muted-foreground/30" size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">No Records Found</h3>
          <p className="text-sm text-muted-foreground">The audit trail is empty for current filter parameters.</p>
        </Card>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden lg:block relative border border-border rounded-2xl overflow-hidden bg-card shadow-2xl">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-b border-border hover:bg-transparent transition-none">
                <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[160px]">Timestamp</TableHead>
                <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[180px]">Performed By</TableHead>
                <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[180px]">Action</TableHead>
                <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              <AnimatePresence mode="popLayout">
                {logs.map((log, idx) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="group border-b border-border hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Timestamp */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        <div className="text-[10px] font-bold text-muted-foreground/80 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-1 opacity-30">/</span>
                          {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </TableCell>

                    {/* Performed By */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-secondary border border-border overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <img src={log.performedBy.avatar} alt={log.performedByHandle} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 bg-background">
                              <User size={12} />
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-bold text-foreground truncate max-w-[120px]">{log.performedByHandle}</div>
                      </div>
                    </TableCell>

                    {/* Action & Entity */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className={cn("px-2 py-0.5 font-black uppercase tracking-widest text-[7px] rounded-md border w-fit whitespace-nowrap", getActionColor(log.action))}>
                          {log.action}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {getEntityIcon(log.entity)}
                          <span className="text-[8px] font-bold uppercase tracking-widest">{log.entity}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(log.details || {}).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-1 text-[10px]">
                            <span className="text-muted-foreground/50 uppercase text-[8px] font-black tracking-tighter shrink-0">{k}:</span>
                            <span className="text-foreground/80 font-medium break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden relative space-y-3">
          <AnimatePresence mode="popLayout">
            {logs.map((log, idx) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-secondary border border-border overflow-hidden shrink-0">
                          {log.performedBy?.avatar ? (
                            <img src={log.performedBy.avatar} alt={log.performedByHandle} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 bg-background">
                              <User size={14} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">{log.performedByHandle}</div>
                          <div className="text-[9px] text-muted-foreground/60 font-medium">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' · '}
                            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {getEntityIcon(log.entity)}
                        <span className="text-[8px] font-bold uppercase tracking-widest">{log.entity}</span>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <Badge variant="outline" className={cn("px-2 py-0.5 font-black uppercase tracking-widest text-[8px] rounded-md border w-fit", getActionColor(log.action))}>
                      {log.action}
                    </Badge>

                    {/* Details */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1.5">
                        {Object.entries(log.details).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-2 text-[10px]">
                            <span className="text-muted-foreground/50 uppercase text-[8px] font-black tracking-tighter shrink-0">{k}:</span>
                            <span className="text-foreground/80 font-medium break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search Admin..." 
            className="pl-10 h-11 bg-background/50 border-border rounded-xl text-sm focus:ring-primary/20"
            value={handleFilter}
            onChange={(e) => { setHandleFilter(e.target.value); setPage(0); }}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filter Action (CREATE, UPDATE)..." 
            className="pl-10 h-11 bg-background/50 border-border rounded-xl text-sm focus:ring-primary/20"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          />
        </div>
        <div className="relative group">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filter Entity (USER, SYSTEM)..." 
            className="pl-10 h-11 bg-background/50 border-border rounded-xl text-sm focus:ring-primary/20"
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Logs Interface */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Audit Registry</span>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {total} Total Events Logged
          </div>
        </div>
        {renderContent()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border bg-card/50 rounded-2xl">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(0); }}>
              <SelectTrigger className="h-9 w-20 bg-background/50 border-border rounded-xl text-xs font-bold focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
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
              Page {page + 1} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(0)}
              disabled={page === 0 || isLoading}
              className="h-9 w-9 rounded-lg bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-30"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0 || isLoading}
              className="h-9 w-9 rounded-lg bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="h-9 w-9 rounded-lg bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="h-9 w-9 rounded-lg bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-30"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
