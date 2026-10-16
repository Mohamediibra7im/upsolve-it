"use client";

import { AdminState, AdminRetry } from "./AdminState";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  useAdminContactMessages,
  markAsRead,
  replyMessage,
  deleteMessage,
} from "@/hooks/admin/useAdminContactMessages";
import {
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminContactMessages() {
  const { messages, isLoading, isError, mutate } = useAdminContactMessages();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setActionError(null);
    try {
      await markAsRead(id);
      await mutate();
    } catch {
      setActionError("Could not mark this message as read. Please try again.");
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    setActionError(null);
    try {
      await replyMessage(id, replyText.trim());
      setReplyText("");
      setReplyingTo(null);
      await mutate();
    } catch {
      setActionError(
        "Could not send your reply. Your draft is still here; please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteMessage(id);
      setDeletingId(null);
      if (expanded === id) setExpanded(null);
      await mutate();
    } catch {
      setActionError("Could not delete this message. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminState
        tone="loading"
        title="Loading messages…"
        description="Getting your workspace ready."
      />
    );
  }

  if (isError) {
    return (
      <AdminState
        tone="error"
        title="Could not load messages"
        description="Your support inbox is temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );
  }

  if (messages.length === 0) {
    return (
      <AdminState
        icon={Mail}
        title="Your inbox is clear"
        description="New questions and feedback from your community will appear here."
      />
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      <div className="flex items-center justify-between pb-2 border-b border-[#2b3031]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#929b98] font-medium text-xs">
            <Mail size={12} className="text-[#b5e3c4]" />
            Support inbox
          </div>
          <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
            Support Inbox
          </h2>
          <p className="text-xs text-[#929b98] font-medium">
            {messages.filter((m) => !m.read).length} unread of {messages.length}{" "}
            total messages
          </p>
        </div>
      </div>

      {actionError && !deletingId && (
        <p
          role="alert"
          className="rounded-xl border border-[#cb9390]/20 bg-[#cb9390]/5 p-4 text-sm leading-6 text-[#dfb4b0]"
        >
          {actionError}
        </p>
      )}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <m.div
              key={msg._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border transition-colors",
                msg.read
                  ? "border-[#2b3031] bg-[#191c1e]"
                  : "border-[#2b3031] bg-[#b5e3c4]/[0.06]",
              )}
            >
              <button
                aria-expanded={expanded === msg._id}
                onClick={() =>
                  setExpanded(expanded === msg._id ? null : msg._id)
                }
                className="w-full flex items-center gap-3 p-5 text-left font-sans"
              >
                <div
                  className={cn(
                    "p-1.5 border rounded-xl shrink-0",
                    msg.read
                      ? "text-[#929b98] border-[#2b3031] bg-[#191c1e]"
                      : "text-[#b5e3c4] border-[#2b3031] bg-[#131715]",
                  )}
                >
                  {msg.read ? (
                    <MailOpen className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium truncate",
                        msg.read ? "text-[#929b98]" : "text-[#f1f3ee]",
                      )}
                    >
                      {msg.subject}
                    </span>
                    {!msg.read && (
                      <span className="px-1.5 py-0.5 border border-[#2b3031] bg-[#b5e3c4]/[0.06] text-[#b5e3c4] text-xs font-medium rounded-xl">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs font-medium text-[#929b98]">
                    <span
                      className={cn(
                        msg.read ? "text-[#929b98]" : "text-[#929b98]",
                      )}
                    >
                      {msg.name}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {expanded === msg._id ? (
                    <ChevronUp className="size-4 text-[#929b98]" />
                  ) : (
                    <ChevronDown className="size-4 text-[#929b98]" />
                  )}
                </div>
              </button>

              {expanded === msg._id && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4 space-y-4 border-t border-[#2b3031] pt-4"
                >
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px] [&_p]:break-words">
                    <div>
                      <span className="text-[#929b98] font-medium">From</span>
                      <p className="font-medium text-[#f1f3ee] mt-1">
                        {msg.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#929b98] font-medium">Email</span>
                      <p className="font-medium text-[#f1f3ee] mt-1">
                        {msg.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#929b98] font-medium">
                        Category
                      </span>
                      <p className="font-medium text-[#f1f3ee] mt-1">
                        {msg.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#929b98] font-medium">Date</span>
                      <p className="font-medium text-[#f1f3ee] mt-1">
                        {new Date(msg.createdAt).toLocaleString(undefined, {
                          hour12: false,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-[#929b98] font-medium">
                      Message
                    </span>
                    <p className="text-sm text-[#b6bdb9] mt-1.5 leading-7 whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {!msg.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleMarkRead(msg._id)}
                        className="h-10 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px]"
                      >
                        Mark as read
                      </Button>
                    )}
                    {replyingTo === msg._id ? (
                      <div className="w-full space-y-2 pt-2">
                        <textarea
                          aria-label="Your reply"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply…"
                          className="w-full rounded-xl border border-[#2b3031] bg-[#101214] p-3 text-[13px] font-sans text-[#f1f3ee] placeholder:text-[#929b98] resize-none focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleReply(msg._id)}
                            disabled={!replyText.trim() || sending}
                            className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
                          >
                            <Send className="size-3 mr-1.5" />
                            {sending ? "Sending…" : "Send reply"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="h-10 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(msg._id);
                          setReplyText("");
                        }}
                        className="h-10 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px]"
                      >
                        Reply
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingId(msg._id)}
                      className="h-10 px-3 rounded-xl border border-red-500/15 text-red-400 hover:bg-red-400/5 font-sans text-[13px]"
                    >
                      <Trash2 className="size-3 mr-1.5" />
                      Delete
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
          <DialogContent className="max-w-md bg-[#191c1e] border border-[#2b3031] text-[#b5e3c4] font-sans rounded-[20px] w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-center mb-1">
                <div className="p-3 rounded-2xl border border-[#cb9390]/20 bg-[#cb9390]/5 text-[#cb9390]">
                  <Shield className="size-6 shrink-0" />
                </div>
              </div>
              <DialogTitle className="text-xl font-medium text-center text-red-400 font-heading tracking-tight">
                Delete this message?
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-xs text-[#929b98] font-medium text-center mt-0.5">
                  Are you sure you want to delete this contact message? This
                  action is irreversible.
                </div>
              </DialogDescription>
            </DialogHeader>
            {actionError && (
              <p role="alert" className="text-sm leading-6 text-[#dfb4b0]">
                {actionError}
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px] h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleDelete(deletingId)}
                disabled={deleting}
                className="rounded-xl bg-[#cb9390] hover:bg-[#deb0ad] text-[#281b1a] font-sans text-[13px] border-transparent h-10"
              >
                {deleting ? "Deleting…" : "Delete message"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
