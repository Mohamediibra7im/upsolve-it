'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAdminContactMessages,
  markAsRead,
  replyMessage,
  type ContactMessage,
} from '@/hooks/admin/useAdminContactMessages';
import { Mail, MailOpen, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminContactMessages() {
  const { messages, isLoading, mutate } = useAdminContactMessages();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Mail className="size-8 mb-2 opacity-40" />
        <p className="text-sm">No contact messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.filter((m) => !m.read).length} unread of {messages.length} total
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <m.div
              key={msg._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl border transition-colors',
                msg.read
                  ? 'border-border/20 bg-card/20'
                  : 'border-primary/20 bg-primary/5',
              )}
            >
              <button
                onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className={cn('p-2 rounded-lg shrink-0', msg.read ? 'text-muted-foreground/40' : 'text-primary')}>
                  {msg.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-semibold truncate', msg.read && 'text-muted-foreground')}>
                      {msg.subject}
                    </span>
                    {!msg.read && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-xs', msg.read ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!msg.read && (
                    <span
                      onClick={(e) => { e.stopPropagation(); void handleMarkRead(msg._id); }}
                      className="p-1.5 rounded-lg text-xs text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      Mark read
                    </span>
                  )}
                  {expanded === msg._id ? <ChevronUp className="size-4 text-muted-foreground/40" /> : <ChevronDown className="size-4 text-muted-foreground/40" />}
                </div>
              </button>

              {expanded === msg._id && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground/50 uppercase tracking-wider">From</span>
                      <p className="font-medium mt-0.5">{msg.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground/50 uppercase tracking-wider">Email</span>
                      <p className="font-medium mt-0.5">{msg.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground/50 uppercase tracking-wider">Category</span>
                      <p className="font-medium mt-0.5 capitalize">{msg.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground/50 uppercase tracking-wider">Received</span>
                      <p className="font-medium mt-0.5">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">Message</span>
                    <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {!msg.read && (
                      <Button size="sm" variant="secondary" onClick={() => void handleMarkRead(msg._id)}>
                        Mark as Read
                      </Button>
                    )}
                    {replyingTo === msg._id ? (
                      <div className="w-full space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="w-full rounded-lg border border-border/40 bg-background/50 p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleReply(msg._id)}
                            disabled={!replyText.trim() || sending}
                          >
                            <Send className="size-3 mr-1" />
                            {sending ? 'Sending...' : 'Send Reply'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setReplyingTo(msg._id); setReplyText(''); }}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                </m.div>
              )}
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
