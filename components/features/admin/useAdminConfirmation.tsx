"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
};

export function useAdminConfirmation() {
  const [request, setRequest] = useState<Confirmation | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const triggerElement = useRef<HTMLElement | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setRequest(null);
  }, []);

  const askConfirmation = useCallback((next: Confirmation) => {
    resolver.current?.(false);
    triggerElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setRequest(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(
    () => () => {
      resolver.current?.(false);
    },
    [],
  );

  const confirmationDialog = (
    <Dialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) settle(false);
      }}
    >
      <DialogContent
        role="alertdialog"
        className="w-[calc(100vw-2rem)] max-w-md rounded-[20px] border-[#2b3031] bg-[#191c1e] p-6 text-[#f1f3ee] sm:p-8"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelButton.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerElement.current?.focus();
        }}
      >
        <div className="flex size-12 items-center justify-center rounded-2xl border border-[#cb9390]/20 bg-[#cb9390]/5 text-[#cb9390]">
          <Trash2 size={20} />
        </div>
        <DialogHeader className="text-left">
          <DialogTitle className="font-heading text-2xl font-medium tracking-[-0.04em]">
            {request?.title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-[#929b98]">
            {request?.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            ref={cancelButton}
            variant="outline"
            className="h-11 rounded-xl border-[#343b37] bg-transparent text-[#f1f3ee]"
            onClick={() => settle(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-11 rounded-xl bg-[#cb9390] text-[#281b1a] hover:bg-[#deb0ad]"
            onClick={() => settle(true)}
          >
            {request?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { askConfirmation, confirmationDialog };
}
