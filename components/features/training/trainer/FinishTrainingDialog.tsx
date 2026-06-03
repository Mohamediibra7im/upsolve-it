"use client";

import { m, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
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
            <div className="rounded-xl xs:rounded-2xl border-2 border-primary/40 bg-background/95 backdrop-blur-xl shadow-2xl">
              <div className="p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="size-10 xs:w-12 xs:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="size-5 xs:h-6 xs:w-6 text-primary" />
                  </div>
                  <h3 id="finish-title" className="text-lg xs:text-xl font-semibold">
                    Finish training?
                  </h3>
                </div>
                <p className="text-sm xs:text-base text-muted-foreground">
                  We will save your session, add unsolved problems to upsolve
                  reminders, and take you to your statistics.
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
                    onClick={onConfirm}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none h-9 xs:h-10"
                  >
                    <Trophy className="size-4 mr-2" />
                    Finish Training
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







