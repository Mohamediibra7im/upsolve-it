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
import Loader from "@/components/shared/Loader";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

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
  });
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
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        await createWhatsNewEntry(form);
        toast({ title: "Entry created successfully", variant: "success" });
      } else if (mode === "edit" && editingId) {
        await updateWhatsNewEntry(editingId, form);
        toast({ title: "Entry updated successfully", variant: "success" });
      }
      await mutate();
      resetEditor();
    } catch (err: any) {
      toast({
        title: err?.message || "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWhatsNewEntry(id);
      toast({ title: "Entry deleted", variant: "success" });
      await mutate();
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast({
        title: err?.message || "Failed to delete entry",
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
        title: entry.isPublished ? "Unpublished" : "Published",
        variant: "success",
      });
      await mutate();
    } catch (err: any) {
      toast({
        title: err?.message || "Failed to update entry",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <Loader message="Loading entries..." />;

  /* ─── Editor View (Create / Edit) ─── */
  if (mode === "create" || mode === "edit") {
    return (
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={resetEditor}
              title="Back to list"
              aria-label="Back to list"
              className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {mode === "create" ? "New Entry" : "Edit Entry"}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {mode === "create"
                  ? "Create a new changelog entry"
                  : "Modify an existing entry"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2 text-xs font-bold"
            >
              {showPreview ? <FileText size={14} /> : <Eye size={14} />}
              {showPreview ? "Editor" : "Preview"}
            </Button>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
                className="size-4 rounded border-border accent-primary"
              />
              Publish
            </label>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={14} />
                  {mode === "create" ? "Create" : "Save"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Dark Mode Support"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Version (optional)
            </label>
            <input
              type="text"
              value={form.version}
              onChange={(e) =>
                setForm((f) => ({ ...f, version: e.target.value }))
              }
              placeholder="e.g. v2.1.0"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Markdown Editor / Preview */}
        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-black/5">
            <FileText size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {showPreview ? "Preview" : "Content (Markdown)"}
            </span>
          </div>

          {showPreview ? (
            <div className="p-6 min-h-[320px]">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-img:rounded-xl prose-blockquote:border-primary/30">
                {form.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {form.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nothing to preview yet...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder={`Write your changelog entry in Markdown...\n\n## New Features\n- Feature one\n- Feature two\n\n## Bug Fixes\n- Fixed issue with...`}
              className="w-full min-h-[320px] p-6 bg-transparent text-foreground text-sm font-mono leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none resize-y"
            />
          )}
        </div>
      </m.div>
    );
  }

  /* ─── List View ─── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Changelog Entries
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          className="gap-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} />
          New Entry
        </Button>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            No entries yet
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Create your first changelog entry to keep users informed.
          </p>
          <Button
            size="sm"
            onClick={openCreate}
            className="gap-2 text-xs font-bold"
          >
            <Plus size={14} />
            Create First Entry
          </Button>
        </m.div>
      )}

      {/* Entry Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <m.div
              key={entry._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group rounded-xl border border-border bg-card/50 p-4 sm:p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {entry.title}
                    </h3>
                    {entry.version && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase">
                        {entry.version}
                      </span>
                    )}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        entry.isPublished
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                          : "bg-amber-500/10 border border-amber-500/20 text-amber-500",
                      )}
                    >
                      {entry.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Created {formatDate(entry.createdAt)}
                    {entry.publishedAt &&
                      ` · Published ${formatDate(entry.publishedAt)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(entry)}
                    title={entry.isPublished ? "Unpublish" : "Publish"}
                    aria-label={entry.isPublished ? "Unpublish" : "Publish"}
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    {entry.isPublished ? (
                      <EyeOff size={14} />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(entry)}
                    title="Edit"
                    aria-label="Edit"
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Pencil size={14} />
                  </button>

                  {deleteConfirmId === entry._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(entry._id)}
                        title="Confirm delete"
                        aria-label="Confirm delete"
                        className="size-8 rounded-lg flex items-center justify-center text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        title="Cancel delete"
                        aria-label="Cancel delete"
                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(entry._id)}
                      title="Delete"
                      aria-label="Delete"
                      className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 size={14} />
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
