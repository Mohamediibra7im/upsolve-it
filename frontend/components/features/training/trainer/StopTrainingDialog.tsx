"use client";

import { useRef } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface StopTrainingDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const StopTrainingDialog = ({ isOpen, onCancel, onConfirm }: StopTrainingDialogProps) => {
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
      <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-[#e5a39d]/10 text-[#e5a39d]"><Square className="size-5" /></div>
      <DialogHeader className="gap-2 text-left">
        <DialogTitle className="font-heading text-2xl font-medium tracking-tight">Discard this session?</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#929b98]">Your current training session and its unsaved progress will be discarded. This can’t be undone. To save your results, choose Finish session instead.</DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-3 gap-3 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="h-11 rounded-xl border-[#39403c] bg-transparent text-sm text-[#b8c0bb] hover:bg-[#b5e3c4]/5 hover:text-[#f1f3ee]">Keep training</Button>
        <Button variant="destructive" onClick={onConfirm} className="h-11 rounded-xl bg-[#c2756d] text-sm text-[#fff6f4] hover:bg-[#ad635c]">Discard session</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

export default StopTrainingDialog;
