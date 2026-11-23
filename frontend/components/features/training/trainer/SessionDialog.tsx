"use client";

import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionDialogProps {
  isOpen: boolean;
  title: string;
  /** What confirming does, in a sentence or two. */
  children: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Asks before a session ends: finishing saves it, discarding throws it away. */
const SessionDialog = ({
  isOpen,
  title,
  children,
  confirmLabel,
  destructive,
  onCancel,
  onConfirm,
}: SessionDialogProps) => {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        onOpenAutoFocus={() => {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocusRef.current?.isConnected) {
            returnFocusRef.current.focus();
          }
        }}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="t-h2">{title}</DialogTitle>
          <DialogDescription className="t-muted">{children}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Keep training
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDialog;
