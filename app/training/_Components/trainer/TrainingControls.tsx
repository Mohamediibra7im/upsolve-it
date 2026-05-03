"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, XCircle } from "lucide-react";
import CountDown from "@/app/training/_Components/CountDown";
import { Training } from "@/types/Training";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface TrainingControlsProps {
  training: Training | null;
  isTraining: boolean;
  isPreContestPeriod: boolean;
  solvedCount: number;
  totalCount: number;
  isRefreshing: boolean;
  refreshProblemStatus: () => void;
  onFinishTraining: () => void;
  onStopTraining: () => void;
}

const TrainingControls = ({
  training,
  isTraining,
  isPreContestPeriod,
  solvedCount,
  totalCount,
  isRefreshing,
  refreshProblemStatus,
  onFinishTraining,
  onStopTraining,
}: TrainingControlsProps) => {
  if (!training) return null;

  const renderActionButtons = (isMobile = false) => {
    const buttonClass = isMobile ? "h-12 flex-1 text-[10px] font-black uppercase tracking-widest" : "w-full h-12 text-xs font-black uppercase tracking-widest";
    
    if (isTraining && isPreContestPeriod) {
      return (
        <Button
          variant="destructive"
          onClick={onStopTraining}
          className={cn(buttonClass, "bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20 transition-all")}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Session
        </Button>
      );
    }

    if (isTraining) {
      return (
        <div className={cn("space-y-3", isMobile && "flex items-center gap-2 space-y-0")}>
          <Button
            variant="outline"
            onClick={refreshProblemStatus}
            className={cn(buttonClass, "bg-background/50 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary")}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing ? "animate-spin" : "")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Status"}
          </Button>
          
          <Button
            onClick={onFinishTraining}
            className={cn(buttonClass, "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20")}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Finish Session
          </Button>
          
          {!isMobile && (
            <Button
              variant="ghost"
              onClick={onStopTraining}
              className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
            >
              Stop Training
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 custom-scrollbar">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl rounded-[2rem]">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-40" />
              
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-primary animate-[pulse_2s_infinite]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                        {isPreContestPeriod ? "Starts In" : "Time Remaining"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative px-1">
                    <CountDown
                      startTime={training.startTime}
                      endTime={training.endTime}
                    />
                  </div>
                  
                  {isTraining && (
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">{solvedCount}</span>
                        <span className="text-xs font-medium text-muted-foreground">/ {totalCount} Solved</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {renderActionButtons()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Pro Tip Card */}
          <motion.div 
            variants={fadeUp} 
            initial="hidden" 
            animate="show"
            transition={{ delay: 0.1 }}
          >
            <div className="p-6 rounded-[1.5rem] border border-border/30 bg-muted/10 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Trophy size={40} />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-medium italic relative z-10">
                "Precision and speed are the keys to victory. Stay focused and keep pushing."
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <AnimatePresence>
        {isTraining && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mx-4 mb-4 overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 backdrop-blur-2xl shadow-2xl shadow-black/20">
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      {isPreContestPeriod ? "Starts In" : "Session Ends In"}
                    </div>
                    <div className="min-w-0">
                      <CountDown
                        startTime={training.startTime}
                        endTime={training.endTime}
                        compact
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Progress</div>
                    <div className="text-sm font-black text-foreground">
                      {solvedCount} <span className="text-muted-foreground font-medium">/ {totalCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {renderActionButtons(true)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrainingControls;







