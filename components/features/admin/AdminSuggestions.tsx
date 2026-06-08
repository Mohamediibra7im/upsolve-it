"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "list" | "create" | "edit";

export default function AdminSuggestions() {
  const { suggestions, isLoading, mutate } = useSuggestionsAdmin();
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Suggestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    isActive: true,
    order: 0,
  });

  const resetForm = () =>
    setForm({ title: "", description: "", url: "", category: "", isActive: true, order: 0 });

  const startCreate = () => {
    resetForm();
    setMode("create");
  };

  const startEdit = (s: Suggestion) => {
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
    if (mode === "create") {
      await createSuggestion(form);
    } else if (editing) {
      await updateSuggestion(editing._id, form);
    }
    await mutate();
    setMode("list");
    setEditing(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteSuggestion(id);
    await mutate();
    setDeletingId(null);
  };

  const toggleActive = async (s: Suggestion) => {
    await updateSuggestion(s._id, { isActive: !s.isActive });
    await mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suggestions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage suggested websites and resources
          </p>
        </div>
        {mode === "list" && (
          <Button onClick={startCreate} className="gap-2">
            <Plus className="size-4" />
            Add Suggestion
          </Button>
        )}
      </div>

      {mode !== "list" && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {mode === "create" ? "New Suggestion" : "Edit Suggestion"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setMode("list"); setEditing(null); resetForm(); }}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                placeholder="Codeforces"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">URL *</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                placeholder="https://codeforces.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                placeholder="Practice"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="size-4 rounded border-border/40 accent-primary"
              />
              Active (visible to users)
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={!form.title || !form.url}>
              <Check className="size-4 mr-1.5" />
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => { setMode("list"); setEditing(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </m.div>
      )}

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s) => (
            <m.div
              key={s._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{s.title}</h3>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground/60 truncate">{s.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {s.category && (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
                      {s.category}
                    </span>
                  )}
                  <span className={cn(
                    "text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded",
                    s.isActive ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground/50 bg-muted/30"
                  )}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    s.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-muted-foreground/40 hover:bg-muted/30"
                  )}
                >
                  {s.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                {deletingId === s._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => void handleDelete(s._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="p-1.5 rounded-lg text-muted-foreground/40 hover:bg-muted/30 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(s._id)}
                    className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
