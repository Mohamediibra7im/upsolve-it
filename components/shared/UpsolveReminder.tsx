"use client";

import { useEffect, useMemo, useState } from "react";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/Toast";
import { Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const SNOOZE_STORAGE_KEY = "training-tracker-upsolve-snoozed";

const UpsolveReminder = () => {
  const { upsolvedProblems, deleteUpsolvedProblem, isLoading } = useUpsolvedProblems();
  const { toast } = useToast();
  const [snoozed, setSnoozed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (globalThis.window === undefined) return;
    try {
      if (globalThis.sessionStorage === undefined) return;
      const val = globalThis.sessionStorage.getItem(SNOOZE_STORAGE_KEY);
      setSnoozed(val === "1");
    } catch (err) {
      console.error("Failed to read snooze from sessionStorage", err);
      setSnoozed(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (globalThis.window !== undefined && globalThis.sessionStorage !== undefined) {
        globalThis.sessionStorage.removeItem(SNOOZE_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
    setSnoozed(false);
  }, [pathname]);

  const firstUnsolved = useMemo(() => {
    if (!upsolvedProblems || upsolvedProblems.length === 0) return null;
    return upsolvedProblems.find((p) => !p.solvedTime) ?? null;
  }, [upsolvedProblems]);

  if (isLoading || snoozed || !firstUnsolved) return null;

  const onUpsolveNow = () => {
    if (!firstUnsolved) return;
    const win = window.open(firstUnsolved.url, "_blank");
    if (win) {
      toast({
        title: "Upsolving...",
        description: `Problem ${firstUnsolved.contestId}-${firstUnsolved.index} launched.`,
        variant: "default",
      });
    }
  };

  const onLater = () => {
    try {
      if (globalThis.window !== undefined && globalThis.sessionStorage !== undefined) {
        globalThis.sessionStorage.setItem(SNOOZE_STORAGE_KEY, "1");
      }
      setSnoozed(true);
      toast({
        title: "Snoozed",
        description: "Reminder hidden for this session.",
      });
    } catch {
      setSnoozed(true);
    }
  };

  const onGiveUp = async () => {
    if (!firstUnsolved) return;
    try {
      await deleteUpsolvedProblem(firstUnsolved);
      toast({
        title: "Problem Removed",
        description: "Successfully cleared from your upsolve list.",
        variant: "destructive",
      });
    } catch {
      // no-op
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full group mb-6"
    >
      {/* Immersive Background Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
      
      <Card className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
        {/* Decorative Light Leaks */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Content Section */}
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
              <div className="relative group/icon">
                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover/icon:blur-2xl transition-all animate-pulse" />
                <div className="relative h-16 w-16 rounded-[1.25rem] bg-background/60 flex items-center justify-center border border-primary/20 shadow-inner group-hover/icon:scale-110 transition-transform duration-500">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Prompt</span>
                  <div className="h-[1px] w-8 bg-primary/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">Upsolve Opportunity</h3>
                <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xl opacity-80">
                  We recommend mastering previous challenges before starting new ones. 
                  Ready to tackle <span className="text-foreground font-black border-b-2 border-primary/30">{firstUnsolved.contestId}-{firstUnsolved.index}</span>?
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full lg:w-auto">
              <Button
                onClick={onUpsolveNow}
                className="w-full sm:w-auto h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 rounded-2xl transition-all hover:-translate-y-1 active:scale-95"
              >
                Upsolve Now
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={onLater}
                  className="h-12 px-6 text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/5"
                >
                  Later
                </Button>
                <div className="h-4 w-[1px] bg-border/40" />
                <Button
                  variant="ghost"
                  onClick={onGiveUp}
                  className="h-12 px-6 text-muted-foreground hover:text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-500/5"
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpsolveReminder;







