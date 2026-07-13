"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "warning" | "destructive";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const t = timersRef.current[id];
    if (t) {
      window.clearTimeout(t);
      delete timersRef.current[id];
    }
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const durationMs = item.durationMs ?? 2800;
      const next: ToastItem = { ...item, id, durationMs };
      setItems((prev) => [...prev, next]);
      timersRef.current[id] = window.setTimeout(() => remove(id), durationMs);
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  useEffect(() => {
    const timersAtMount = timersRef.current;
    return () => {
      Object.values(timersAtMount).forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[99999] top-24 right-4 left-4 sm:left-auto sm:top-24 sm:bottom-auto flex flex-col gap-2 pointer-events-none max-w-sm sm:max-w-md mx-auto sm:mx-0">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onClose={() => remove(item.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const variantClasses: Record<ToastVariant, string> = {
  default: "border-emerald-500/25 bg-[#060a08] text-emerald-400",
  success: "border-emerald-500 bg-[#060a08] text-emerald-300",
  warning: "border-amber-500/30 bg-[#060a08] text-amber-400",
  destructive: "border-red-500/30 bg-[#060a08] text-red-400",
};

const variantIcons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: AlertCircle,
  success: Check,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

const variantBarColors: Record<ToastVariant, string> = {
  default: "bg-emerald-500",
  success: "bg-emerald-400",
  warning: "bg-amber-500",
  destructive: "bg-red-500",
};

const ToastCard = ({ item, onClose }: { item: ToastItem; onClose: () => void }) => {
  const { title, description, variant = "default" } = item;
  const IconComponent = variantIcons[variant];

  return (
    <div className={cn(
      "relative overflow-hidden border rounded font-mono p-4",
      "shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-3",
      "duration-200 ease-out hover:border-emerald-500/50 transition-all",
      variantClasses[variant]
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className="size-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-bold text-xs uppercase tracking-wider mb-1 leading-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="text-[10px] text-emerald-500/40 leading-relaxed">
              {description}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          aria-label="Close notification"
          className="flex-shrink-0 p-0.5 rounded text-emerald-500/30 hover:text-emerald-400 transition-colors"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-950/20">
        <div
          className={cn(
            "h-full animate-progress-shrink origin-left",
            variantBarColors[variant]
          )}
          style={{ animationDuration: `${item.durationMs ?? 2800}ms` }}
        />
      </div>
    </div>
  );
};
