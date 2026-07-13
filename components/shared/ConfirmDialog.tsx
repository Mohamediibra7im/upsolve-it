"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { TrainingProblem } from "@/types/TrainingProblem";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  problem?: TrainingProblem | null;
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  problem,
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-red-500/25 bg-[#060a08] p-6 text-emerald-400 font-mono rounded-sm shadow-[0_6px_22px_rgba(0,0,0,0.7)]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/15 rounded-sm border border-red-500/20 text-red-400 animate-pulse">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-red-400">
              Delete Problem
            </DialogTitle>
          </div>

          <DialogDescription asChild>
            <div className="text-left space-y-3 font-mono">
              <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed">
                Are you sure you want to remove this problem from your upsolve list?
              </p>

              {problem && (
                <div className="p-4 bg-[#040604] rounded-sm border border-emerald-500/15 space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-wider">Problem Details:</h4>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-300 truncate uppercase" title={problem.name}>
                        {problem.name}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-emerald-500/50 font-bold uppercase">
                        <span>Rating: {problem.rating}</span>
                        <span>•</span>
                        <span>Contest: {problem.contestId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[9px] text-red-400/80 uppercase tracking-wide leading-relaxed">
                This action cannot be undone. The problem will be permanently removed from your upsolve list.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-emerald-500/5">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 transition-all font-mono"
          >
            [ CANCEL ]
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 px-4 rounded-sm bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>DELETING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Trash2 className="size-3.5" />
                <span>[ EXECUTE_DELETE.EXE ]</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
