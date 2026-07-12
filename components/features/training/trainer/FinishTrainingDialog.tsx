"use client";

import { m, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinishTrainingDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const FinishTrainingDialog = ({
  isOpen,
  onCancel,
  onConfirm,
}: FinishTrainingDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="finish-title"
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
            <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-[#060a08] shadow-[0_0_30px_rgba(16,185,129,0.06)]">
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.06]" />

              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-emerald-500/15 bg-[#081210]">
                <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-400/60">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>SYS.COMPLETE // FINALIZE_SESSION</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500/50 animate-pulse" />
                  <span className="text-[8px] font-bold tracking-widest text-emerald-500/40">READY</span>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 shrink-0 rounded border border-emerald-500/20 bg-emerald-950/15 flex items-center justify-center text-emerald-400">
                    <Trophy size={16} />
                  </div>
                  <div className="space-y-1">
                    <h3 id="finish-title" className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                      Compile Session Results?
                    </h3>
                    <p className="text-[11px] leading-relaxed text-emerald-500/50">
                      Session data will be saved to the performance database. Unsolved problem
                      nodes will be queued for upsolve reminders. You will be redirected to
                      the statistics review terminal.
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
                    [ CONTINUE_SESSION.SH ]
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="flex-1 h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all font-mono"
                  >
                    [ FINALIZE_RUN.EXE ]
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

export default FinishTrainingDialog;
