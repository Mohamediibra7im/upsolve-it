'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAdminContactMessages,
  markAsRead,
  replyMessage,
  deleteMessage,
  type ContactMessage,
} from '@/hooks/admin/useAdminContactMessages';
import { Mail, MailOpen, ChevronDown, ChevronUp, Send, Trash2, Shield, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function AdminContactMessages() {
  const { messages, isLoading, mutate } = useAdminContactMessages();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    await mutate();
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await replyMessage(id, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      await mutate();
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteMessage(id);
      setDeletingId(null);
      if (expanded === id) setExpanded(null);
      await mutate();
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-emerald-400">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">INBOX_SYNCHRONIZING.SYS...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-500/40 rounded-none border border-dashed border-emerald-500/10 space-y-3 font-mono">
        <Mail className="size-8 text-emerald-500/20 animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-widest">[ NO_CONTACT_MESSAGES ]</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500/40 font-bold text-[9px] uppercase tracking-widest">
            <Mail size={12} className="text-emerald-400" />
            SYSOP_MAIL // INBOX_CONSOLE
          </div>
          <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">Support Inbox</h2>
          <p className="text-[10px] text-emerald-500/40 font-bold uppercase tracking-wider">
            {messages.filter((m) => !m.read).length} unread of {messages.length} total messages
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <m.div
              key={msg._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-none border transition-colors',
                msg.read
                  ? 'border-emerald-500/10 bg-[#060a08]/20'
                  : 'border-emerald-500/25 bg-emerald-500/5',
              )}
            >
              <button
                onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}
                className="w-full flex items-center gap-4 p-4 text-left font-mono"
              >
                <div className={cn('p-1.5 border rounded-none shrink-0', msg.read ? 'text-emerald-500/30 border-emerald-500/10 bg-[#060a08]/40' : 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20')}>
                  {msg.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold tracking-wide truncate', msg.read ? 'text-emerald-500/50' : 'text-emerald-300')}>
                      {msg.subject}
                    </span>
                    {!msg.read && (
                      <span className="px-1.5 py-0.5 border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase rounded-none">
                        [NEW]
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 uppercase text-[9px] font-bold text-emerald-500/40">
                    <span className={cn(msg.read ? 'text-emerald-500/40' : 'text-emerald-500/60')}>
                      {msg.name}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                      }).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.read && (
                    <span
                      onClick={(e) => { e.stopPropagation(); void handleMarkRead(msg._id); }}
                      className="px-2 py-0.5 border border-emerald-500/15 bg-transparent hover:bg-emerald-500/10 text-[8px] font-bold uppercase tracking-widest text-emerald-400 cursor-pointer"
                    >
                      [ MARK_READ ]
                    </span>
                  )}
                  {expanded === msg._id ? <ChevronUp className="size-4 text-emerald-500/40" /> : <ChevronDown className="size-4 text-emerald-500/40" />}
                </div>
              </button>

              {expanded === msg._id && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-4 space-y-4 border-t border-emerald-500/10 pt-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                    <div>
                      <span className="text-emerald-500/35 font-bold uppercase tracking-widest">SENDER_NODE</span>
                      <p className="font-bold text-emerald-300 mt-1 uppercase">{msg.name}</p>
                    </div>
                    <div>
                      <span className="text-emerald-500/35 font-bold uppercase tracking-widest">EMAIL_ADDR</span>
                      <p className="font-bold text-emerald-300 mt-1">{msg.email}</p>
                    </div>
                    <div>
                      <span className="text-emerald-500/35 font-bold uppercase tracking-widest">CATEGORY_TAG</span>
                      <p className="font-bold text-emerald-300 mt-1 uppercase">{msg.category}</p>
                    </div>
                    <div>
                      <span className="text-emerald-500/35 font-bold uppercase tracking-widest">TIMESTAMP</span>
                      <p className="font-bold text-emerald-300 mt-1 uppercase">
                        {new Date(msg.createdAt).toLocaleString(undefined, { hour12: false }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-emerald-500/35 font-bold uppercase tracking-widest">MESSAGE_BODY</span>
                    <p className="text-xs text-emerald-300/80 mt-1.5 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {!msg.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleMarkRead(msg._id)}
                        className="h-8 px-3 rounded-none border border-emerald-500/15 text-emerald-450 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest"
                      >
                        [ MARK_AS_READ ]
                      </Button>
                    )}
                    {replyingTo === msg._id ? (
                      <div className="w-full space-y-2 pt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply logs here..."
                          className="w-full rounded-none border border-emerald-500/15 bg-[#040604]/50 p-3 text-xs font-mono text-emerald-300 placeholder:text-emerald-500/20 resize-none focus:outline-none focus:border-emerald-500/45 focus:ring-0"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleReply(msg._id)}
                            disabled={!replyText.trim() || sending}
                            className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent"
                          >
                            <Send className="size-3 mr-1.5" />
                            {sending ? 'SENDING...' : '[ TRANSMIT_REPLY.EXE ]'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            className="h-8 px-3 rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest"
                          >
                            [ CANCEL ]
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setReplyingTo(msg._id); setReplyText(''); }}
                        className="h-8 px-3 rounded-none border border-emerald-500/15 text-emerald-450 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest"
                      >
                        [ REPLY ]
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingId(msg._id)}
                      className="h-8 px-3 rounded-none border border-red-500/15 text-red-400 hover:bg-red-955/10 font-mono text-[9px] uppercase tracking-widest"
                    >
                      <Trash2 className="size-3 mr-1.5" />
                      [ DELETE ]
                    </Button>
                  </div>
                </m.div>
              )}
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {deletingId && (
        <Dialog open onOpenChange={() => !deleting && setDeletingId(null)}>
          <DialogContent className="max-w-md bg-[#060a08] border border-emerald-500/25 text-emerald-400 font-mono rounded-none">
            <DialogHeader>
              <div className="flex justify-center mb-1">
                <div className="p-3 border border-red-500/20 bg-red-955/10 text-red-400">
                  <Shield className="size-6 shrink-0 animate-pulse" />
                </div>
              </div>
              <DialogTitle className="text-xs font-bold uppercase tracking-widest text-center text-red-400">
                DELETE_CONFIRMATION
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-[10px] text-emerald-500/40 font-bold uppercase text-center mt-0.5">
                  Are you sure you want to delete this contact message? This action is irreversible.
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest h-8"
              >
                [ CANCEL ]
              </Button>
              <Button
                onClick={() => void handleDelete(deletingId)}
                disabled={deleting}
                className="rounded-none bg-red-650 hover:bg-red-500 text-red-50 font-mono text-[9px] uppercase tracking-widest border-transparent h-8 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                {deleting ? 'DELETING...' : '[ ERASE_LOGS.EXE ]'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
