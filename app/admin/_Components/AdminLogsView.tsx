'use client';

import { useState } from 'react';
import { useAdminLogs } from '@/hooks/admin/useAdminLogs';
import { Card, CardContent } from '@/components/ui/card';
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accessing Encrypted Records...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-xl rounded-[2rem] p-20 text-center">
          <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-destructive opacity-50" size={32} />
          </div>
          <h3 className="text-xl font-bold text-destructive">Secure Connection Failed</h3>
          <p className="text-sm text-muted-foreground mb-6">We couldn't retrieve the audit logs. You may not have sufficient permissions or the session expired.</p>
          <Button onClick={() => globalThis.location.reload()} variant="outline" className="rounded-xl">
            Retry Authorization
          </Button>
        </Card>
      );
    }

    if (logs.length === 0) {
      return (
        <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] p-20 text-center">
          <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-muted-foreground opacity-20" size={32} />
          </div>
          <h3 className="text-xl font-bold">No Records Found</h3>
          <p className="text-sm text-muted-foreground">The audit trail is empty for current filter parameters.</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="border-border/40 bg-card/10 hover:bg-card/20 transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center p-4 md:p-6 gap-4 md:gap-8">
                    {/* Timestamp */}
                    <div className="flex items-center gap-3 shrink-0 min-w-[140px]">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-2 opacity-30">|</span>
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Performed By */}
                    <div className="flex items-center gap-3 shrink-0 min-w-[180px]">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                        {log.performedBy?.avatar ? (
                          <img src={log.performedBy.avatar} alt={log.performedByHandle} className="h-full w-full object-cover" />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-tight">{log.performedByHandle}</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Administrator</div>
                      </div>
                    </div>

                    {/* Action & Entity */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={cn("px-3 py-1 font-black uppercase tracking-widest text-[9px] rounded-lg", getActionColor(log.action))}>
                        {log.action}
                      </Badge>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-border/40 rounded-lg text-muted-foreground">
                        {getEntityIcon(log.entity)}
                        <span className="text-[9px] font-black uppercase tracking-widest">{log.entity}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] text-muted-foreground/80 font-medium truncate">
                        {Object.entries(log.details || {}).map(([k, v]) => (
                          <span key={k} className="mr-4">
                            <span className="opacity-50 lowercase italic mr-1">{k}:</span>
                            <span className="text-foreground/90">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">System Audit Logs</h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Permanent Immutable Activity Record</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-card/30 border-border/40 px-4 py-2 rounded-xl">
            <Activity className="h-3 w-3 mr-2 text-emerald-500 animate-pulse" />
            <span className="text-sm font-black">{total}</span>
            <span className="ml-2 text-[10px] uppercase tracking-widest opacity-60">Total Events</span>
          </Badge>
        </div>

        <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Filter by Admin Handle..." 
                  className="pl-12 h-12 bg-white/5 border-border/40 rounded-xl focus:border-primary/50"
                  value={handleFilter}
                  onChange={(e) => { setHandleFilter(e.target.value); setPage(0); }}
                />
              </div>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Action (e.g. CREATE, UPDATE)..." 
                  className="pl-12 h-12 bg-white/5 border-border/40 rounded-xl focus:border-primary/50"
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                />
              </div>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Entity (USER, NOTIFICATION)..." 
                  className="pl-12 h-12 bg-white/5 border-border/40 rounded-xl focus:border-primary/50"
                  value={entityFilter}
                  onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {renderContent()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <Button
            variant="outline"
            disabled={page === 0 || isLoading}
            onClick={() => setPage(p => p - 1)}
            className="h-10 px-4 rounded-xl bg-card/20 border-border/40 hover:bg-primary/10"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Transmission {page + 1} / {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="h-10 px-4 rounded-xl bg-card/20 border-border/40 hover:bg-primary/10"
          >
            Next
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
