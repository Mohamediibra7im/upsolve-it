"use client";

import { useAdminConfirmation } from "./useAdminConfirmation";

import { AdminState, AdminRetry } from "./AdminState";

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
  FileText,
  Sparkles,
  Send,
  ArrowLeft,
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
  });
}

export default function AdminWhatsNew() {
  const { entries, isLoading, isError, mutate } = useWhatsNewAdmin();
  const { toast } = useToast();

  const [mode, setMode] = useState<EditorMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { askConfirmation, confirmationDialog } = useAdminConfirmation();

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
      toast({
        title: "Check the required fields",
        description: "Title and content fields are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        await createWhatsNewEntry(form);
        toast({
          title: "Update created",
          description: "Your product update has been created.",
          variant: "success",
        });
      } else if (mode === "edit" && editingId) {
        await updateWhatsNewEntry(editingId, form);
        toast({
          title: "Update saved",
          description: "Your product update has been saved.",
          variant: "success",
        });
      }
      await mutate();
      resetEditor();
    } catch (err: any) {
      toast({
        title: "Could not save changes",
        description: err?.message || "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !(await askConfirmation({
        title: "Delete this update?",
        description:
          "This permanently removes the update. It will no longer be available to your members.",
        confirmLabel: "Delete update",
      }))
    )
      return;
    try {
      await deleteWhatsNewEntry(id);
      toast({
        title: "Update deleted",
        description: "The product update has been deleted.",
        variant: "success",
      });
      await mutate();
    } catch (err: any) {
      toast({
        title: "Could not delete",
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
        title: "Status updated",
        description: `Entry status set to ${!entry.isPublished ? "Published" : "Draft"}`,
        variant: "success",
      });
      await mutate();
    } catch (err: any) {
      toast({
        title: "Could not update",
        description: err?.message || "Failed to update entry.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminState
        tone="loading"
        title="Loading updates…"
        description="Getting your workspace ready."
      />
    );
  }

  if (isError) {
    return (
      <AdminState
        tone="error"
        title="Could not load updates"
        description="Your product updates are temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );
  }

  /* ─── Editor View (Create / Edit) ─── */
  if (mode === "create" || mode === "edit") {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 font-sans text-[#f1f3ee]"
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#2b3031]">
          <div className="flex items-center gap-3">
            <button
              onClick={resetEditor}
              title="Back to list"
              aria-label="Back to list"
              className="size-10 rounded-xl border border-[#2b3031] bg-[#191c1e] flex items-center justify-center text-[#929b98] hover:text-[#f1f3ee] hover:border-[#2b3031] transition-all shrink-0"
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
                {mode === "create" ? "Create an update" : "Edit update"}
              </h2>
              <p className="text-xs font-medium text-[#929b98] mt-0.5">
                {mode === "create"
                  ? "Share what changed with your community."
                  : "Refine the details of this product update."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-sans text-[13px] gap-1.5"
            >
              {showPreview ? <FileText size={12} /> : <Eye size={12} />}
              <span>{showPreview ? "Write" : "Preview"}</span>
            </Button>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#929b98] cursor-pointer border border-[#2b3031] h-10 px-3 bg-[#191c1e] hover:bg-[#b5e3c4]/[0.06] transition-all">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
                className="size-3.5 border-[#2b3031] text-[#b5e3c4] bg-transparent rounded-xl focus:ring-2 focus:ring-[#b5e3c4]/30 accent-[#b5e3c4]"
              />
              <span>Publish</span>
            </label>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent gap-1.5"
            >
              {isSaving ? (
                <>Saving…</>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save update</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(150px,1fr)]">
          <div>
            <label className="block text-xs font-medium text-[#929b98] mb-1.5">
              Title
            </label>
            <input
              type="text"
              aria-label="Update title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Dark Mode Support"
              className="w-full px-4 py-2.5 rounded-xl bg-[#101214] border border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#929b98] mb-1.5">
              Version
            </label>
            <input
              type="text"
              aria-label="Version"
              value={form.version}
              onChange={(e) =>
                setForm((f) => ({ ...f, version: e.target.value }))
              }
              placeholder="e.g. v2.1.0"
              className="w-full px-4 py-2.5 rounded-xl bg-[#101214] border border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 transition-all"
            />
          </div>
        </div>

        {/* Markdown Editor / Preview */}
        <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] overflow-hidden shadow-none">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2b3031] bg-black/10">
            <FileText size={12} className="text-[#929b98]" />
            <span className="text-xs font-medium text-[#929b98]">
              {showPreview ? "Preview" : "Content · Markdown supported"}
            </span>
          </div>

          {showPreview ? (
            <div className="p-6 min-h-[420px] bg-[#101214]">
              <MarkdownRenderer className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-medium prose-headings:text-[#f1f3ee] prose-p:text-[#929b98] prose-strong:text-[#f1f3ee] prose-a:text-[#b5e3c4] prose-code:text-[#b5e3c4] prose-code:bg-[#131715] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-[#2b3031] prose-pre:rounded-xl prose-img:rounded-xl prose-blockquote:border-[#2b3031]">
                {form.content || (
                  <p className="text-[#929b98] italic">
                    Start writing to preview your update.
                  </p>
                )}
              </MarkdownRenderer>
            </div>
          ) : (
            <textarea
              aria-label="Update content"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder={`Write your changelog entry in Markdown...\n\n## New Features\n- Feature one\n- Feature two\n\n## Bug Fixes\n- Fixed issue with...`}
              className="w-full min-h-[420px] p-6 bg-transparent text-[#f1f3ee] text-sm font-sans leading-7 placeholder:text-[#929b98] focus:outline-none resize-y"
            />
          )}
        </div>
      </m.div>
    );
  }

  /* ─── List View ─── */
  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#929b98] font-medium text-xs">
            <FileText size={12} className="text-[#b5e3c4]" />
            Product updates
          </div>
          <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
            Product updates
          </h2>
          <p className="text-xs text-[#929b98] font-medium mt-0.5">
            {entries.length} product update{" "}
            {entries.length === 1 ? "entry" : "entries"} in total
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
        >
          <Plus size={12} className="mr-1.5 shrink-0" />
          <span>Create update</span>
        </Button>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-[#2b3031] space-y-4"
        >
          <div className="size-12 rounded-xl bg-[#131715] border border-[#2b3031] flex items-center justify-center">
            <Sparkles size={20} className="text-[#b5e3c4]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-medium text-[#f1f3ee] font-heading tracking-tight">
              Keep your community in the loop
            </h3>
            <p className="text-xs text-[#929b98] max-w-[240px] mx-auto">
              Share new features, improvements, and fixes with your members.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-10 px-4 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-medium text-[13px] font-sans"
          >
            <Plus size={12} className="mr-1.5 shrink-0" />
            <span>Write your first update</span>
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
              className="group rounded-xl border border-[#2b3031] bg-[#191c1e] p-5 transition-all hover:border-[#2b3031] hover:shadow-none"
            >
              <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base font-medium text-[#f1f3ee] group-hover:text-[#f1f3ee] transition-colors truncate font-heading tracking-tight">
                      {entry.title}
                    </h3>
                    {entry.version && (
                      <span className="px-2 py-0.5 border border-[#2b3031] bg-[#131715] text-[#b5e3c4] text-xs font-medium rounded-xl">
                        {entry.version}
                      </span>
                    )}
                    <span
                      className={cn(
                        "px-2 py-0.5 border text-xs font-medium rounded-xl",
                        entry.isPublished
                          ? "bg-[#b5e3c4]/[0.06] border-[#2b3031] text-[#b5e3c4]"
                          : "bg-amber-400/5 border-amber-500/20 text-amber-400",
                      )}
                    >
                      {entry.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#929b98]">
                    Created: {formatDate(entry.createdAt)}
                    {entry.publishedAt &&
                      ` · Published ${formatDate(entry.publishedAt)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t border-[#2b3031] pt-4 sm:border-0 sm:pt-0">
                  <button
                    onClick={() => handleTogglePublish(entry)}
                    title={entry.isPublished ? "Unpublish" : "Publish"}
                    aria-label={entry.isPublished ? "Unpublish" : "Publish"}
                    className="size-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] flex items-center justify-center text-[#b5e3c4] transition-all"
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
                    className="size-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] flex items-center justify-center text-[#b5e3c4] transition-all"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    aria-label={`Delete ${entry.title}`}
                    onClick={() => void handleDelete(entry._id)}
                    className="flex size-10 items-center justify-center rounded-xl border border-[#cb9390]/20 text-[#cb9390] transition-colors hover:bg-[#cb9390]/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
      {confirmationDialog}
    </div>
  );
}
