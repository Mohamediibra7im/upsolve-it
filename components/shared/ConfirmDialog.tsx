"use client";

import { useRef } from "react";
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
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={() => {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current?.isConnected) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
        className="sm:max-w-md border border-border bg-card p-6 text-foreground font-sans rounded-2xl shadow-none"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/15 rounded-xl border border-red-500/20 text-red-400 ">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="text-xl font-medium text-foreground">
              Remove problem
            </DialogTitle>
          </div>

          <DialogDescription asChild>
            <div className="text-left space-y-3 font-sans">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to remove this problem from your upsolve
                list?
              </p>

              {problem && (
                <div className="p-4 bg-background rounded-xl border border-border space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-muted-foreground  ">
                      Problem Details:
                    </h4>
                    <div className="space-y-0.5">
                      <p
                        className="text-xs font-medium text-foreground truncate "
                        title={problem.name}
                      >
                        {problem.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium ">
                        <span>Rating: {problem.rating}</span>
                        <span>•</span>
                        <span>Contest: {problem.contestId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-red-400/80   leading-relaxed">
                This action cannot be undone. The problem will be permanently
                removed from your upsolve list.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl border border-border bg-transparent text-primary font-medium   text-xs hover:bg-primary/10 transition-all font-sans"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium   text-xs font-sans shadow-none transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Removing…</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Trash2 className="size-3.5" />
                <span>Remove problem</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
