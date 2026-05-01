"use client";

import useTraining from "@/hooks/useTraining";
import Trainer from "./_Components/Trainer";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import TagSelector from "./_Components/TagSelector";
import LevelSelector from "./_Components/LevelSelector";
import useTags from "@/hooks/useTags";
import useUser from "@/hooks/useUser";
import Loader from "@/app/_Components/Loader";
import UpsolveReminder from "@/app/_Components/UpsolveReminder";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function TrainingPage() {
  const { user } = useUser();
  const { allTags, selectedTags, onTagClick, onClearTags } = useTags();
  const {
    startTraining,
    stopTraining,
    problems,
    training,
    isTraining,
    isLoading,
    isRefreshing,
    refreshProblemStatus,
    finishTraining,
    generateProblems,
    submissionStatuses,
  } = useTraining();

  const [customRatings, setCustomRatings] = useState<{
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }>(() => {
    if (globalThis.window !== undefined) {
      const stored = localStorage.getItem("training-tracker-customRatings");
      if (stored) return JSON.parse(stored);
    }
    return { P1: 800, P2: 800, P3: 800, P4: 800 };
  });

  useEffect(() => {
    localStorage.setItem(
      "training-tracker-customRatings",
      JSON.stringify(customRatings),
    );
  }, [customRatings]);

  const [showRatings, setShowRatings] = useState(false);

  const handleLevelChange = (ratings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => {
    setCustomRatings(ratings);
  };

  if (isLoading) return <Loader />;
  if (!user) return <Loader />;

  if (isTraining) {
    return (
      <section className="min-h-screen relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Focus Mode Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16">
          <UpsolveReminder />
          
          <motion.div 
            className="text-center space-y-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Active Session</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
                Master the <span className="text-primary italic">Grind</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto opacity-80">
                You are in focused mode. Eliminate distractions, analyze each problem carefully, and break your limits.
              </p>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <Trainer
              isTraining={isTraining}
              training={training}
              problems={problems}
              generateProblems={generateProblems}
              startTraining={startTraining}
              stopTraining={stopTraining}
              refreshProblemStatus={refreshProblemStatus}
              finishTraining={finishTraining}
              selectedTags={selectedTags}
              lb={null}
              ub={null}
              customRatings={customRatings}
              submissionStatuses={submissionStatuses}
              isRefreshing={isRefreshing}
              showRatings={showRatings}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden pb-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        <UpsolveReminder />

        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            Professional Training
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.95]">
            Create Your <span className="gradient-text">Contest</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Configure your perfect practice environment. Select your level, target specific topics, and start your journey to mastery.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:gap-16">
          {/* Configuration Grid */}
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Level Selection Section */}
            <section className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <LevelSelector
                  onLevelChange={handleLevelChange}
                  currentRatings={customRatings}
                  showRatings={showRatings}
                  setShowRatings={setShowRatings}
                />
              </motion.div>
            </section>
            {/* Tags Section */}
            <motion.section 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Target Tags</h3>
                </div>
                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">Optional</span>
              </div>
              
              <Card className="border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 sm:p-8">
                    <TagSelector
                      allTags={allTags}
                      selectedTags={selectedTags}
                      onTagClick={onTagClick}
                      onClearTags={onClearTags}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.section>
            {/* Action Footer / Trainer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-4"
            >
              <Trainer
                isTraining={isTraining}
                training={training}
                problems={problems}
                generateProblems={generateProblems}
                startTraining={startTraining}
                stopTraining={stopTraining}
                refreshProblemStatus={refreshProblemStatus}
                finishTraining={finishTraining}
                selectedTags={selectedTags}
                lb={null}
                ub={null}
                customRatings={customRatings}
                submissionStatuses={submissionStatuses}
                isRefreshing={isRefreshing}
                showRatings={showRatings}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}






