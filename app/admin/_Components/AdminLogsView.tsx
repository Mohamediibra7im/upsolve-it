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
  Info,
  Shield,
  Tag,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogsView() {
  const [page, setPage] = useState(0);
  const limit = 20;
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [handleFilter, setHandleFilter] = useState('');

  const { logs, total, isLoading, isError } = useAdminLogs({
    limit,
    offset: page * limit,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
    performedByHandle: handleFilter || undefined,
  });

  const totalPages = Math.ceil(total / limit);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (action.includes('UPDATE')) return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.includes('ROLE')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'USER': return <User size={14} />;
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
      <div className="space-y-1 border border-border rounded-2xl overflow-hidden bg-card shadow-2xl">
        <div className="grid grid-cols-[140px_200px_160px_1fr] gap-4 px-6 py-3 bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
          <div>Timestamp</div>
          <div>Performed By</div>
          <div>Action Type</div>
          <div>Audit Details</div>
        </div>
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.01 }}
              className="grid grid-cols-[140px_200px_160px_1fr] gap-4 px-6 py-4 hover:bg-white/[0.03] border-b border-border last:border-0 transition-colors items-center"
            >
              {/* Timestamp */}
              <div className="flex items-center gap-2.5">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                <div className="text-[10px] font-bold text-muted-foreground/80">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <span className="mx-1.5 opacity-20">/</span>
                  {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Performed By */}
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
                <div className="text-[11px] font-bold text-foreground truncate">{log.performedByHandle}</div>
              </div>

              {/* Action & Entity */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("px-2 py-0.5 font-black uppercase tracking-widest text-[8px] rounded-md border", getActionColor(log.action))}>
                  {log.action}
                </Badge>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  {getEntityIcon(log.entity)}
                  <span className="text-[8px] font-bold uppercase tracking-widest">{log.entity}</span>
                </div>
              </div>

              {/* Details */}
              <div className="text-[10px] text-muted-foreground font-medium truncate">
                {Object.entries(log.details || {}).map(([k, v]) => (
                  <span key={k} className="mr-4 inline-flex items-center gap-1">
                    <span className="text-muted-foreground/60 uppercase text-[8px] font-black tracking-tighter">{k}:</span>
                    <span className="text-foreground/80">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
        <div className="flex items-center justify-center gap-6 py-4">
          <Button
            variant="ghost"
            disabled={page === 0 || isLoading}
            onClick={() => setPage(p => p - 1)}
            className="h-9 px-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary text-[10px] font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} className="mr-2" />
            Prev
          </Button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Page {page + 1} of {totalPages}
          </div>
          <Button
            variant="ghost"
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="h-9 px-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary text-[10px] font-bold uppercase tracking-widest"
          >
            Next
            <ChevronRight size={14} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
