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
import { Trash2 } from "lucide-react";
import type { UpsolveProblem } from "@/types/UpsolveProblem";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  problem?: UpsolveProblem | null;
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
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="t-h2">Remove this problem?</DialogTitle>
          <DialogDescription asChild>
            <div className="grid gap-3 text-left">
              <p className="t-muted">
                It leaves your upsolve list for good and will not come back on
                the next sync.
              </p>
              {problem && (
                <div className="u-panel u-panel--sunk grid gap-1 px-4 py-3 text-ink">
                  <b className="truncate" title={problem.name}>
                    {problem.name}
                  </b>
                  <span className="t-sm t-muted t-num">
                    Rating {problem.rating} · Contest {problem.contestId}
                  </span>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Trash2 />
            {isLoading ? "Removing…" : "Remove problem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
