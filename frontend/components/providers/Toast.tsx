"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

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

// Problems stay longer than confirmations: they take longer to read and act on.
const DURATION: Record<ToastVariant, number> = {
  default: 4000,
  success: 4000,
  warning: 6000,
  destructive: 8000,
};
const MAX_VISIBLE = 3;

const ICON: Record<ToastVariant, typeof Check> = {
  default: Info,
  success: Check,
  warning: TriangleAlert,
  destructive: CircleAlert,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) =>
      [
        // the same message again replaces the one on screen instead of stacking
        ...prev.filter(
          (i) => i.title !== item.title || i.description !== item.description,
        ),
        { ...item, id },
      ].slice(-MAX_VISIBLE),
    );
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Bottom corner: clear of the page's main action, which sits top right. */}
      <div role="region" aria-label="Notifications" className="u-toasts">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={remove} />
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

const ToastCard = ({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: (id: string) => void;
}) => {
  const { id, title, description, variant = "default" } = item;
  const Icon = ICON[variant];
  const duration = item.durationMs ?? DURATION[variant];

  // The clock stops while the pointer or the keyboard focus is on the toast.
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = window.setTimeout(() => onClose(id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, id, onClose]);

  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      data-variant={variant}
      className="u-toast animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="u-toast__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="min-w-0 self-center">
        {title && <b className="block">{title}</b>}
        {description && (
          <span className="t-sm t-muted block">{description}</span>
        )}
      </div>
      <button
        type="button"
        aria-label="Close notification"
        className="u-btn u-btn--ghost u-btn--icon u-btn--sm"
        onClick={() => onClose(id)}
      >
        <X />
      </button>
      <i
        className="u-toast__clock animate-progress-shrink"
        style={{
          animationDuration: `${duration}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </div>
  );
};
