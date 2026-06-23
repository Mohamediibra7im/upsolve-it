"use client";

import { m, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
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
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.div
            className="relative z-10 w-full max-w-sm xs:max-w-md"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="rounded-xl xs:rounded-2xl border-2 border-red-500/40 bg-background/95 backdrop-blur-xl shadow-2xl">
              <div className="p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="size-10 xs:w-12 xs:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="size-5 xs:h-6 xs:w-6 text-red-500" />
                  </div>
                  <h3 id="stop-title" className="text-lg xs:text-xl font-semibold">
                    Stop training?
                  </h3>
                </div>
                <p className="text-sm xs:text-base text-muted-foreground">
                  This will end your current session without saving it. Are you
                  sure you want to stop?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:justify-end pt-1 xs:pt-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 sm:flex-none h-9 xs:h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onConfirm}
                    className="flex-1 sm:flex-none h-9 xs:h-10"
                  >
                    Stop Training
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







