"use client";

import { useState, useCallback } from "react";
import {
  useWhatsNewAdmin,
  createWhatsNewEntry,
  updateWhatsNewEntry,
  deleteWhatsNewEntry,
  type WhatsNewEntry,
} from "@/hooks/admin";
import { useToast } from "@/components/providers/Toast";
import { m, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  FileText,
  Sparkles,
  Send,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/ui/markdown-renderer";

type EditorMode = "list" | "create" | "edit";

interface FormState {
  title: string;
  content: string;
  version: string;
  isPublished: boolean;
}

const emptyForm: FormState = {
  title: "",
  content: "",
  version: "",
  isPublished: false,
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).toUpperCase();
}

export default function AdminWhatsNew() {
  const { entries, isLoading, mutate } = useWhatsNewAdmin();
  const { toast } = useToast();

  const [mode, setMode] = useState<EditorMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const resetEditor = useCallback(() => {
    setMode("list");
    setEditingId(null);
    setForm(emptyForm);
    setShowPreview(false);
  }, []);

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setShowPreview(false);
  };

  const openEdit = (entry: WhatsNewEntry) => {
    setMode("edit");
    setEditingId(entry._id);
    setForm({
      title: entry.title,
      content: entry.content,
      version: entry.version,
      isPublished: entry.isPublished,
    });
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "SYS.ERR: VALIDATION FAILED", description: "Title and content fields are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        await createWhatsNewEntry(form);
        toast({ title: "CHANGELOG: ENTRY CREATED", description: "Successfully injected changelog entry node.", variant: "success" });
      } else if (mode === "edit" && editingId) {
        await updateWhatsNewEntry(editingId, form);
        toast({ title: "CHANGELOG: ENTRY UPDATED", description: "Successfully committed changelog changes.", variant: "success" });
      }
      await mutate();
      resetEditor();
    } catch (err: any) {
      toast({
        title: "SYS.ERR: COMMIT FAILED",
        description: err?.message || "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWhatsNewEntry(id);
      toast({ title: "CHANGELOG: ENTRY DELETED", description: "Successfully removed changelog node.", variant: "success" });
      await mutate();
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast({
        title: "SYS.ERR: DELETE FAILED",
        description: err?.message || "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (entry: WhatsNewEntry) => {
    try {
      await updateWhatsNewEntry(entry._id, {
        isPublished: !entry.isPublished,
      });
      toast({
        title: "CHANGELOG: UPDATE COMMITTED",
        description: `Entry status set to ${!entry.isPublished ? "PUBLISHED" : "DRAFT"}`,
        variant: "success",
      });
      await mutate();
    } catch (err: any) {
      toast({
        title: "SYS.ERR: UPDATE FAILED",
        description: err?.message || "Failed to update entry.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-emerald-400">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">CHANGELOG_SYNCHRONIZING.SYS...</p>
      </div>
    );
  }

  /* ─── Editor View (Create / Edit) ─── */
  if (mode === "create" || mode === "edit") {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 font-mono text-emerald-400"
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <button
              onClick={resetEditor}
              title="Back to list"
              aria-label="Back to list"
              className="size-8 rounded-none border border-emerald-500/15 bg-[#060a08]/30 flex items-center justify-center text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/30 transition-all shrink-0"
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-300">
                {mode === "create" ? "NEW_CHANGELOG_ENTRY" : "EDIT_CHANGELOG_ENTRY"}
              </h2>
              <p className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-wider mt-0.5">
                {mode === "create"
                  ? "Configure and compile a new version logs page"
                  : "Modify an existing version parameters node"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-450 font-mono text-[9px] uppercase tracking-widest gap-1.5"
            >
              {showPreview ? <FileText size={12} /> : <Eye size={12} />}
              <span>{showPreview ? "[ EDITOR ]" : "[ PREVIEW ]"}</span>
            </Button>

            <label className="inline-flex items-center gap-2 text-[9px] font-bold text-emerald-500/50 cursor-pointer select-none uppercase border border-emerald-500/15 h-8 px-3 bg-[#060a08]/30 hover:bg-emerald-500/5 transition-all">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
                className="size-3.5 border-emerald-500/20 text-emerald-500 bg-transparent rounded-none focus:ring-0 accent-emerald-500"
              />
              <span>[ PUBLISH ]</span>
            </label>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent gap-1.5"
            >
              {isSaving ? (
                <>SAVING...</>
              ) : (
                <>
                  <Save size={12} />
                  <span>[ COMMIT_ENTRY.EXE ]</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mb-1.5">
              TITLE_HEX
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Dark Mode Support"
              className="w-full px-4 py-2.5 rounded-none bg-[#040604]/50 border border-emerald-500/15 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0 transition-all"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mb-1.5">
              VERSION_TAG
            </label>
            <input
              type="text"
              value={form.version}
              onChange={(e) =>
                setForm((f) => ({ ...f, version: e.target.value }))
              }
              placeholder="e.g. v2.1.0"
              className="w-full px-4 py-2.5 rounded-none bg-[#040604]/50 border border-emerald-500/15 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0 transition-all"
            />
          </div>
        </div>

        {/* Markdown Editor / Preview */}
        <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-500/15 bg-black/10">
            <FileText size={12} className="text-emerald-500/40" />
            <span className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest">
              {showPreview ? "PREVIEW_WINDOW" : "CONTENT_MARKDOWN_COMPILER"}
            </span>
          </div>

          {showPreview ? (
            <div className="p-6 min-h-[320px] bg-[#040604]/20">
              <MarkdownRenderer
                className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-emerald-300 prose-p:text-emerald-400/80 prose-strong:text-emerald-300 prose-a:text-emerald-400 prose-code:text-emerald-350 prose-code:bg-emerald-950/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-emerald-500/10 prose-pre:rounded-none prose-img:rounded-none prose-blockquote:border-emerald-500/20"
              >
                {form.content || (
                  <p className="text-emerald-500/20 italic">
                    Nothing to compile yet...
                  </p>
                )}
              </MarkdownRenderer>
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder={`Write your changelog entry in Markdown...\n\n## New Features\n- Feature one\n- Feature two\n\n## Bug Fixes\n- Fixed issue with...`}
              className="w-full min-h-[320px] p-6 bg-transparent text-emerald-350 text-xs font-mono leading-relaxed placeholder:text-emerald-500/20 focus:outline-none resize-y"
            />
          )}
        </div>
      </m.div>
    );
  }

  /* ─── List View ─── */
  return (
    <div className="space-y-8 font-mono text-emerald-400">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500/40 font-bold text-[9px] uppercase tracking-widest">
            <FileText size={12} className="text-emerald-400" />
            SYSOP_NEWS // CHANGELOG_REGISTRY
          </div>
          <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">
            Changelog Logs
          </h2>
          <p className="text-[10px] text-emerald-500/40 font-bold uppercase tracking-wider mt-0.5">
            {entries.length} version registry {entries.length === 1 ? "entry" : "entries"} compiled
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent"
        >
          <Plus size={12} className="mr-1.5 shrink-0" />
          <span>[ NEW_ENTRY.BAT ]</span>
        </Button>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-none border border-dashed border-emerald-500/10 space-y-4"
        >
          <div className="size-12 rounded-none bg-emerald-955/15 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles size={20} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              NO_ENTRIES_COMPILED
            </h3>
            <p className="text-[9px] text-emerald-500/30 uppercase max-w-[240px] mx-auto">
              Create your first version log entry to notify the user console.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-8 px-4 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest text-[9px] font-mono"
          >
            <Plus size={12} className="mr-1.5 shrink-0" />
            <span>[ INITIALIZE_ENTRY.EXE ]</span>
          </Button>
        </m.div>
      )}

      {/* Entry Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <m.div
              key={entry._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-5 transition-all hover:border-emerald-500/35 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-emerald-300 group-hover:text-emerald-250 transition-colors tracking-wide truncate">
                      {entry.title}
                    </h3>
                    {entry.version && (
                      <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-955/15 text-emerald-400 text-[8px] font-bold uppercase rounded-none">
                        [{entry.version}]
                      </span>
                    )}
                    <span
                      className={cn(
                        "px-2 py-0.5 border text-[8px] font-bold uppercase rounded-none",
                        entry.isPublished
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-955/10 border-amber-500/20 text-amber-400",
                      )}
                    >
                      {entry.isPublished ? "[PUBLISHED]" : "[DRAFT]"}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-emerald-500/35 uppercase">
                    COMPILED: {formatDate(entry.createdAt)}
                    {entry.publishedAt &&
                      ` // PUSHED: ${formatDate(entry.publishedAt)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(entry)}
                    title={entry.isPublished ? "Unpublish" : "Publish"}
                    aria-label={entry.isPublished ? "Unpublish" : "Publish"}
                    className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-all"
                  >
                    {entry.isPublished ? (
                      <EyeOff size={12} />
                    ) : (
                      <Send size={12} />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(entry)}
                    title="Edit"
                    aria-label="Edit"
                    className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-450 transition-all"
                  >
                    <Pencil size={12} />
                  </button>

                  {deleteConfirmId === entry._id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(entry._id)}
                        title="Confirm delete"
                        aria-label="Confirm delete"
                        className="h-7 px-2 rounded-none border border-red-500/25 bg-red-955/10 text-red-400 hover:bg-red-500/20 text-[8px] font-bold uppercase transition-all"
                      >
                        [ CONFIRM ]
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        title="Cancel delete"
                        aria-label="Cancel delete"
                        className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(entry._id)}
                      title="Delete"
                      aria-label="Delete"
                      className="size-7 rounded-none border border-red-500/15 hover:bg-red-955/10 flex items-center justify-center text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
