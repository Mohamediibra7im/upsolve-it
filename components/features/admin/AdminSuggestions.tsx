"use client";

import { useAdminConfirmation } from "./useAdminConfirmation";

import { AdminState, AdminRetry } from "./AdminState";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  useSuggestionsAdmin,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
  type Suggestion,
} from "@/hooks/admin/useSuggestions";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpRight,
  X,
  Check,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "list" | "create" | "edit";

export default function AdminSuggestions() {
  const { suggestions, isLoading, isError, mutate } = useSuggestionsAdmin();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Suggestion | null>(null);
  const { askConfirmation, confirmationDialog } = useAdminConfirmation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    isActive: true,
    order: 0,
  });

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      url: "",
      category: "",
      isActive: true,
      order: 0,
    });

  const startCreate = () => {
    setActionError(null);
    resetForm();
    setMode("create");
  };

  const startEdit = (s: Suggestion) => {
    setActionError(null);
    setForm({
      title: s.title,
      description: s.description,
      url: s.url,
      category: s.category,
      isActive: s.isActive,
      order: s.order,
    });
    setEditing(s);
    setMode("edit");
  };

  const handleSubmit = async () => {
    if (!form.title || !form.url) return;
    setActionError(null);
    setIsSaving(true);
    try {
      if (mode === "create") {
        await createSuggestion(form);
      } else if (editing) {
        await updateSuggestion(editing._id, form);
      }
      await mutate();
      setMode("list");
      setEditing(null);
      resetForm();
    } catch {
      setActionError(
        "Could not save this resource. Your changes are still here; please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !(await askConfirmation({
        title: "Delete this resource?",
        description:
          "This permanently removes the resource. It will no longer be available to your members.",
        confirmLabel: "Delete resource",
      }))
    )
      return;
    setActionError(null);
    try {
      await deleteSuggestion(id);
      await mutate();
    } catch {
      setActionError("Could not delete this resource. Please try again.");
    }
  };

  const toggleActive = async (s: Suggestion) => {
    setActionError(null);
    try {
      await updateSuggestion(s._id, { isActive: !s.isActive });
      await mutate();
    } catch {
      setActionError(
        "Could not change this resource’s visibility. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <AdminState
        tone="loading"
        title="Loading resources…"
        description="Getting your workspace ready."
      />
    );
  }

  if (isError) {
    return (
      <AdminState
        tone="error"
        title="Could not load resources"
        description="Your recommended resources are temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#929b98] font-medium text-xs">
            <LinkIcon size={12} className="text-[#b5e3c4]" />
            Recommended resources
          </div>
          <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
            Suggested Resources
          </h2>
          <p className="text-xs text-[#929b98] font-medium">
            Curate useful websites, guides, and tools for your community.
          </p>
        </div>
        {mode === "list" && (
          <Button
            onClick={startCreate}
            className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
          >
            <Plus className="mr-1.5 size-3.5" />
            <span>Add resource</span>
          </Button>
        )}
      </div>

      {actionError && (
        <p
          role="alert"
          className="rounded-xl border border-[#cb9390]/20 bg-[#cb9390]/5 p-4 text-sm leading-6 text-[#dfb4b0]"
        >
          {actionError}
        </p>
      )}
      {mode !== "list" && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-[#2b3031] bg-[#191c1e] p-6 sm:p-8 space-y-6 shadow-none"
        >
          <div className="flex items-center justify-between border-b border-[#2b3031] pb-2">
            <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
              {mode === "create" ? "Add a resource" : "Edit resource"}
            </h2>
            <button
              onClick={() => {
                setMode("list");
                setEditing(null);
                resetForm();
              }}
              className="size-10 rounded-xl border border-[#2b3031] bg-transparent hover:bg-[#b5e3c4]/[0.06] flex items-center justify-center text-[#929b98] hover:text-[#f1f3ee] transition-all shrink-0"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#929b98]">
                Title *
              </label>
              <input
                aria-label="Resource title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
                placeholder="Codeforces"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#929b98]">
                URL *
              </label>
              <input
                aria-label="Resource URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
                placeholder="https://codeforces.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#929b98]">
                Category
              </label>
              <input
                aria-label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
                placeholder="Practice"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#929b98]">
                Order
              </label>
              <input
                type="number"
                aria-label="Display order"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] text-[13px] font-sans focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-medium text-[#929b98]">
                Description
              </label>
              <input
                aria-label="Resource description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] text-[13px] font-sans placeholder:text-[#929b98] focus:outline-none focus:border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#929b98] cursor-pointer border border-[#2b3031] h-10 px-3 bg-[#191c1e] hover:bg-[#b5e3c4]/[0.06] transition-all">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="size-3.5 border-[#2b3031] text-[#b5e3c4] bg-transparent rounded-xl focus:ring-2 focus:ring-[#b5e3c4]/30 accent-[#b5e3c4]"
              />
              <span>Visible to members</span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !form.title || !form.url}
              className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
            >
              <Check className="size-3 mr-1.5" />
              <span>
                {isSaving
                  ? "Saving…"
                  : mode === "create"
                    ? "Add resource"
                    : "Save changes"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMode("list");
                setEditing(null);
                resetForm();
              }}
              className="h-10 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px]"
            >
              Cancel
            </Button>
          </div>
        </m.div>
      )}

      {/* Empty State */}
      {mode === "list" && suggestions.length === 0 && (
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
              Share your first resource
            </h3>
            <p className="text-xs text-[#929b98] max-w-[240px] mx-auto">
              Add a useful guide or tool for your members to explore.
            </p>
          </div>
          <Button
            onClick={startCreate}
            className="h-10 px-4 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-medium text-[13px] font-sans"
          >
            <Plus size={12} className="mr-1.5 shrink-0" />
            <span>Add a resource</span>
          </Button>
        </m.div>
      )}

      {mode === "list" && (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <m.div
                key={s._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-stretch justify-between gap-4 p-5 sm:flex-row sm:items-center rounded-[20px] border border-[#2b3031] bg-[#191c1e] hover:border-[#2b3031] hover:bg-[#191c1e] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-[#f1f3ee] truncate font-heading tracking-tight">
                      {s.title}
                    </h3>
                    <a
                      aria-label={`Open ${s.title}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#929b98] hover:text-[#f1f3ee] transition-colors"
                    >
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                  <p className="text-sm leading-6 text-[#929b98] mt-1 line-clamp-2">
                    {s.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {s.category && (
                      <span className="text-xs font-medium text-[#b5e3c4] bg-[#131715] border border-[#2b3031] px-1.5 py-0.5 rounded-xl">
                        {s.category}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-xl border",
                        s.isActive
                          ? "text-[#b5e3c4] border-[#2b3031] bg-[#b5e3c4]/[0.06]"
                          : "text-[#929b98] border-[#2b3031] bg-transparent",
                      )}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-[#2b3031] pt-4 sm:border-0 sm:pt-0">
                  <button
                    aria-label={`${s.isActive ? "Hide" : "Show"} ${s.title}`}
                    onClick={() => toggleActive(s)}
                    className={cn(
                      "size-10 rounded-xl border flex items-center justify-center transition-colors",
                      s.isActive
                        ? "text-[#b5e3c4] border-[#2b3031] hover:bg-[#b5e3c4]/[0.06]"
                        : "text-[#929b98] border-[#2b3031] hover:bg-[#b5e3c4]/[0.06]",
                    )}
                  >
                    {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    aria-label={`Edit ${s.title}`}
                    onClick={() => startEdit(s)}
                    className="size-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] flex items-center justify-center text-[#b5e3c4] transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    aria-label={`Delete ${s.title}`}
                    onClick={() => void handleDelete(s._id)}
                    className="flex size-10 items-center justify-center rounded-xl border border-[#cb9390]/20 text-[#cb9390] transition-colors hover:bg-[#cb9390]/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {confirmationDialog}
    </div>
  );
}
