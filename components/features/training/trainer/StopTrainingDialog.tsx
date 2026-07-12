"use client";

import { m, AnimatePresence } from "framer-motion";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StopTrainingDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const StopTrainingDialog = ({
  isOpen,
  onCancel,
  onConfirm,
}: StopTrainingDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stop-title"
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <m.div
            className="absolute inset-0 bg-black/70"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.div
            className="relative z-10 w-full max-w-sm xs:max-w-md font-mono"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-lg border border-red-500/30 bg-[#0a0606] shadow-[0_0_30px_rgba(239,68,68,0.08)]">
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.06]" />

              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-red-500/15 bg-[#120808]">
                <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-red-400/60">
                  <ShieldAlert size={12} className="text-red-400 animate-pulse" />
                  <span>SYS.INTERRUPT // ABORT_CONFIRMATION</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-red-500/50 animate-pulse" />
                  <span className="text-[8px] font-bold tracking-widest text-red-500/40">CRITICAL</span>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 shrink-0 rounded border border-red-500/20 bg-red-950/15 flex items-center justify-center text-red-400">
                    <TriangleAlert size={16} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 id="stop-title" className="text-sm font-bold text-red-300 uppercase tracking-wider">
                      Terminate Active Session?
                    </h3>
                    <p className="text-[11px] leading-relaxed text-red-500/50">
                      This action will abort the current training compilation and discard all
                      unsaved progress data. This operation cannot be reversed.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-10 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 active:scale-[0.98] transition-all font-mono"
                  >
                    [ RESUME_SESSION.SH ]
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onConfirm}
                    className="flex-1 h-10 rounded bg-red-600 text-red-50 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.98] transition-all font-mono"
                  >
                    [ ABORT_SESSION.EXE ]
                  </Button>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default StopTrainingDialog;
