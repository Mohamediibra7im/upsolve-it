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
  Sparkles,
  Link as LinkIcon,
  Loader2,
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
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-emerald-400">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">SUGGESTIONS_SYNCHRONIZING.SYS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500/40 font-bold text-[9px] uppercase tracking-widest">
            <LinkIcon size={12} className="text-emerald-400" />
            SYSOP_DIRECTORY // PLATFORM_SUGGESTIONS
          </div>
          <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">Suggested Resources</h2>
          <p className="text-[10px] text-emerald-500/40 font-bold uppercase tracking-wider">
            Manage suggested websites, reference logs, and training tools.
          </p>
        </div>
        {mode === "list" && (
          <Button
            onClick={startCreate}
            className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent"
          >
            <Plus className="mr-1.5 size-3.5" />
            <span>[ ADD_SUGGESTION.BAT ]</span>
          </Button>
        )}
      </div>

      {mode !== "list" && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-6 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              {mode === "create" ? "CREATE_SUGGESTION_NODE" : "EDIT_SUGGESTION_NODE"}
            </h2>
            <button
              onClick={() => { setMode("list"); setEditing(null); resetForm(); }}
              className="size-7 rounded-none border border-emerald-500/15 bg-transparent hover:bg-emerald-500/10 flex items-center justify-center text-emerald-500/60 hover:text-emerald-300 transition-all shrink-0"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">TITLE_REF *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-8 px-3 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0"
                placeholder="Codeforces"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">URL_REF *</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full h-8 px-3 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0"
                placeholder="https://codeforces.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">CATEGORY_TAG</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-8 px-3 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0"
                placeholder="Practice"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">ORDER_INDEX</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full h-8 px-3 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-500/45 focus:ring-0"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">DESCRIPTION_LOG</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full h-8 px-3 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 text-xs font-mono placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/45 focus:ring-0"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="inline-flex items-center gap-2 text-[9px] font-bold text-emerald-500/50 cursor-pointer select-none uppercase border border-emerald-500/15 h-8 px-3 bg-[#060a08]/30 hover:bg-emerald-500/5 transition-all">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="size-3.5 border-emerald-500/20 text-emerald-500 bg-transparent rounded-none focus:ring-0 accent-emerald-500"
              />
              <span>[ ACTIVE_STATUS ]</span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!form.title || !form.url}
              className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent"
            >
              <Check className="size-3 mr-1.5" />
              <span>[ {mode === "create" ? "CREATE_SUGGESTION.EXE" : "COMMIT_CHANGES.EXE"} ]</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => { setMode("list"); setEditing(null); resetForm(); }}
              className="h-8 px-3 rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest"
            >
              [ CANCEL ]
            </Button>
          </div>
        </m.div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && (
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
              NO_SUGGESTIONS_CONFIGURED
            </h3>
            <p className="text-[9px] text-emerald-500/30 uppercase max-w-[240px] mx-auto">
              Create platform resources cards to populate user dashboards.
            </p>
          </div>
          <Button
            onClick={startCreate}
            className="h-8 px-4 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest text-[9px] font-mono"
          >
            <Plus size={12} className="mr-1.5 shrink-0" />
            <span>[ INITIALIZE_SUGGESTION.BAT ]</span>
          </Button>
        </m.div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s) => (
            <m.div
              key={s._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between gap-4 p-4 rounded-none border border-emerald-500/15 bg-[#060a08]/30 hover:border-emerald-500/35 hover:bg-[#060a08]/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-300 truncate tracking-wide">{s.title}</h3>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500/40 hover:text-emerald-300 transition-colors"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
                <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5 truncate">{s.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {s.category && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-955/15 border border-emerald-500/15 px-1.5 py-0.5 rounded-none">
                      [{s.category}]
                    </span>
                  )}
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none border",
                    s.isActive ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-emerald-500/40 border-emerald-500/10 bg-transparent"
                  )}>
                    {s.isActive ? "[ACTIVE]" : "[INACTIVE]"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  className={cn(
                    "size-7 rounded-none border flex items-center justify-center transition-colors",
                    s.isActive
                      ? "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                      : "text-emerald-500/40 border-emerald-500/10 hover:bg-emerald-500/5"
                  )}
                >
                  {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-450 transition-colors"
                >
                  <Pencil size={12} />
                </button>
                {deletingId === s._id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void handleDelete(s._id)}
                      className="h-7 px-2 rounded-none border border-red-500/25 bg-red-955/10 text-red-400 hover:bg-red-500/20 text-[8px] font-bold uppercase transition-all"
                    >
                      [ CONFIRM ]
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(s._id)}
                    className="size-7 rounded-none border border-red-500/15 hover:bg-red-955/10 flex items-center justify-center text-red-455 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
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
