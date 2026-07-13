"use client";

import { ArrowLeft, CheckCircle, User, Settings, Play, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { m as motion } from "framer-motion";

interface QuickStartGuideProps {
  onBack: () => void;
}

const quickStartSteps = [
  {
    id: 1,
    title: "Create Your Account",
    description: "Sign up with your Codeforces handle and create a secure PIN.",
    icon: User,
    time: "2 MINUTES",
    steps: [
      "Go to the homepage and click on the register/login area",
      "Enter your Codeforces handle exactly as it appears on Codeforces",
      "Create a secure 4-digit PIN (remember this for future logins)",
      "The system will automatically fetch your profile data",
      "Complete the registration process",
    ],
    tips: [
      "Make sure your Codeforces handle is spelled correctly",
      "Choose a PIN that you can remember but others cannot guess",
      "Your profile will sync automatically with Codeforces data",
    ],
  },
  {
    id: 2,
    title: "Set Up Your Profile",
    description: "Sync your Codeforces data and configure your preferences.",
    icon: Settings,
    time: "3 MINUTES",
    steps: [
      "After logging in, click on your profile avatar",
      "Select \"Sync Profile\" to update your latest data",
      "Review your statistics and performance metrics",
      "Adjust theme settings (dark/light mode) if desired",
      "Explore the notification center (bell icon)",
    ],
    tips: [
      "Profile sync updates your rating, solved problems, and submissions",
      "Sync regularly to keep your data current",
      "Check notifications for important updates and announcements",
    ],
  },
  {
    id: 3,
    title: "Start Your First Practice Session",
    description: "Generate problems and begin practicing with customized difficulty.",
    icon: Play,
    time: "5 MINUTES",
    steps: [
      "Navigate to the \"Training\" page from the main menu",
      "Select your preferred difficulty level or set a custom rating range",
      "Choose specific problem tags to focus on (optional)",
      "Set the number of problems you want to practice",
      "Click \"Generate Problems\" to start your session",
      "Work through problems and track your progress",
    ],
    tips: [
      "Start with easier problems if you are new to competitive programming",
      "Focus on specific tags to improve weak areas",
      "Take breaks between problems to avoid fatigue",
    ],
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Monitor your performance and analyze your improvement.",
    icon: BarChart,
    time: "2 MINUTES",
    steps: [
      "Visit the \"Statistics\" page to view your analytics",
      "Review your activity heatmap to see daily practice",
      "Analyze your rating progression over time",
      "Check your problem-solving speed and accuracy",
      "Identify areas for improvement based on tag performance",
    ],
    tips: [
      "Regular practice shows better results in the heatmap",
      "Focus on consistency rather than solving many problems at once",
      "Use statistics to identify your strong and weak problem categories",
    ],
  },
];

export default function QuickStartGuide({ onBack }: Readonly<QuickStartGuideProps>) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono text-emerald-400 select-none relative z-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="h-9 px-3 rounded-sm border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-mono text-[9px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="size-3.5 mr-1" /> [ BACK ]
        </Button>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
            <span>GETTING_STARTED</span>
            <span>{"//"}</span>
            <span>QUICK_START_GUIDE</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Quick Start Guide</h1>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 uppercase tracking-wider">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xs font-bold text-emerald-300">OVERVIEW_ANALYTICS</h3>
            <p className="text-[10px] text-emerald-500/60 max-w-sm">
              Complete these 4 simple steps to get started with Upsolve.it.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="text-center">
              <div className="text-xl text-emerald-400">12</div>
              <div className="text-[8px] text-emerald-500/40 mt-0.5">MINUTES</div>
            </div>
            <div className="h-6 w-[1px] bg-emerald-500/10" />
            <div className="text-center">
              <div className="text-xl text-white">04</div>
              <div className="text-[8px] text-emerald-500/40 mt-0.5">STEPS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Timeline */}
      <div className="relative space-y-6 before:absolute before:left-5 before:top-6 before:bottom-6 before:w-[1px] before:bg-emerald-500/10">
        {quickStartSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative pl-12"
            >
              {/* Step Indicator */}
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="size-10 rounded-sm bg-[#060a08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-none relative z-10">
                  <Icon className="size-5 text-emerald-400" />
                </div>
              </div>

              <Card className="border border-emerald-500/15 bg-[#060a08]/30 rounded-sm overflow-hidden group hover:border-emerald-500/25 transition-all duration-300">
                <CardContent className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40">STEP_0{step.id}</span>
                        <Badge variant="outline" className="border border-emerald-500/15 bg-emerald-950/10 text-[8px] font-bold tracking-wider px-1.5 py-0.2 rounded-sm text-emerald-400">
                          {step.time}
                        </Badge>
                      </div>
                      <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">{step.description}</p>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-emerald-500/10">
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-white">Execution Steps</h4>
                      <div className="space-y-2">
                        {step.steps.map((s, sIdx) => (
                          <div key={`step-${step.id}-${sIdx}`} className="flex items-start gap-2 text-[9px] uppercase leading-relaxed text-emerald-500/65">
                            <span className="text-emerald-400 font-bold shrink-0">[✓]</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-sm bg-amber-500/5 border border-amber-500/15">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Tactical Tips</h4>
                      <div className="space-y-2">
                        {step.tips.map((tip, tIdx) => (
                          <div key={`tip-${step.id}-${tIdx}`} className="flex items-start gap-2 text-[9px] uppercase leading-relaxed text-amber-500/70">
                            <span className="text-amber-500/40 shrink-0">&gt;</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Card className="border border-emerald-500/20 bg-emerald-500/5 rounded-sm p-6 text-center space-y-4">
          <div className="space-y-2">
            <div className="size-11 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Configured!</h2>
              <p className="text-[10px] text-emerald-500/60 uppercase max-w-sm mx-auto leading-relaxed">
                You are ready to begin training sessions. Re-authenticate or query statistics database below.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              className="w-full sm:w-auto h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all font-mono"
              onClick={() => globalThis.location.href = "/training"}
            >
              [ INITIALIZE_TRAINING.EXE ]
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
              onClick={() => globalThis.location.href = "/statistics"}
            >
              [ VIEW_ANALYTICS.SYS ]
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
