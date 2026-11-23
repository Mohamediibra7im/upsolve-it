"use client";

import { useRef } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface FinishTrainingDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const FinishTrainingDialog = ({ isOpen, onCancel, onConfirm }: FinishTrainingDialogProps) => {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
  <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
    <DialogContent
      onOpenAutoFocus={() => {
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
      }}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-[#39403c] bg-[#191c1e] p-6 font-sans text-[#f1f3ee] sm:rounded-2xl sm:p-7">
      <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-[#b5e3c4]/10 text-[#b5e3c4]"><Trophy className="size-5" /></div>
      <DialogHeader className="gap-2 text-left">
        <DialogTitle className="font-heading text-2xl font-medium tracking-tight">Ready to wrap up?</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#929b98]">We’ll save your session and take you to your results. Unsolved problems will be added to your upsolve reminders, so you can return to them later.</DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-3 gap-3 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl border-[#39403c] bg-transparent text-sm text-[#b8c0bb] hover:bg-[#b5e3c4]/5 hover:text-[#f1f3ee]">Keep training</Button>
        <Button onClick={onConfirm} className="h-11 rounded-xl bg-[#b5e3c4] text-sm text-[#101214] hover:bg-[#ceedd8]">Finish session</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

export default FinishTrainingDialog;
