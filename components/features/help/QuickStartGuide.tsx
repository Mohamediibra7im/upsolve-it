"use client";

import {
  ArrowLeft,
  CheckCircle,
  User,
  Settings,
  Play,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { m as motion } from "framer-motion";

interface QuickStartGuideProps {
  onBack: () => void;
}

const quickStartSteps = [
  {
    id: 1,
    title: "Create your account",
    description:
      "Sign up with your Codeforces handle and create a secure password.",
    icon: User,
    time: "2 minutes",
    steps: [
      "Choose Create account from the home page",
      "Enter your Codeforces handle exactly as it appears on Codeforces",
      "Create a secure password (remember this for future logins)",
      "The system will automatically fetch your profile data",
      "Complete the registration process",
    ],
    tips: [
      "Make sure your Codeforces handle is spelled correctly",
      "Choose a password that you can remember but others cannot guess",
      "Your profile will sync automatically with Codeforces data",
    ],
  },
  {
    id: 2,
    title: "Set up your profile",
    description: "Sync your Codeforces data and configure your preferences.",
    icon: Settings,
    time: "3 minutes",
    steps: [
      "After logging in, click on your profile avatar",
      'Select "Sync Profile" to update your latest data',
      "Review your statistics and performance metrics",
      "Explore your dashboard and recent activity",
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
    title: "Start your first session",
    description:
      "Generate problems and begin practicing with customized difficulty.",
    icon: Play,
    time: "5 minutes",
    steps: [
      'Navigate to the "Training" page from the main menu',
      "Use the level controls to choose your preferred difficulty",
      "Choose specific problem tags to focus on (optional)",
      "Choose a training mode to set the session length and problem count",
      "Generate your problems, then choose Start session",
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
    title: "Track your progress",
    description: "Monitor your performance and analyze your improvement.",
    icon: BarChart,
    time: "2 minutes",
    steps: [
      'Visit the "Statistics" page to view your analytics',
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

export default function QuickStartGuide({
  onBack,
}: Readonly<QuickStartGuideProps>) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans text-[#f1f3ee]  relative z-10">
      {/* Header */}
      <div className="flex flex-col items-start gap-5 sm:gap-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-9 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:text-[#b5e3c4] hover:bg-[#b5e3c4]/5 font-sans text-xs font-medium tracking-normal"
        >
          <ArrowLeft className="size-3.5 mr-1" /> Back
        </Button>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#929b98] tracking-normal">
            <span>Getting started</span>
            <span aria-hidden="true">/</span>
            <span>Quick start</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
            Your first steps.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#929b98]">
            A short guide to setting up your space, finding a challenge, and
            building a practice routine.
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border border-[#2b3031] bg-[#191c1e] rounded-2xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 tracking-normal">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-medium text-[#b5e3c4]">
              Four steps to your first session
            </h3>
            <p className="text-sm text-[#929b98] max-w-sm">
              Complete these 4 simple steps to get started with Upsolve.it.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="text-center">
              <div className="text-xl text-[#b5e3c4]">12</div>
              <div className="text-xs text-[#929b98] mt-0.5">minutes</div>
            </div>
            <div className="h-6 w-[1px] bg-[#b5e3c4]/10" />
            <div className="text-center">
              <div className="text-xl text-[#f1f3ee]">04</div>
              <div className="text-xs text-[#929b98] mt-0.5">steps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Timeline */}
      <div className="relative space-y-6 sm:before:absolute sm:before:left-5 sm:before:top-6 sm:before:bottom-6 sm:before:w-px sm:before:bg-[#2b3031]">
        {quickStartSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative sm:pl-16"
            >
              {/* Step Indicator */}
              <div className="absolute left-0 top-1.5 hidden items-center justify-center sm:flex">
                <div className="size-10 rounded-xl bg-[#191c1e] border border-[#2b3031] flex items-center justify-center text-[#b5e3c4] shadow-none relative z-10">
                  <Icon className="size-5 text-[#b5e3c4]" />
                </div>
              </div>

              <Card className="border border-[#2b3031] bg-[#191c1e] rounded-2xl overflow-hidden group hover:border-[#69746e] transition-all duration-300">
                <CardContent className="p-5 space-y-5 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium tracking-normal text-[#929b98]">
                          Step {step.id}
                        </span>
                        <Badge
                          variant="outline"
                          className="border border-[#2b3031] bg-[#b5e3c4]/10 text-xs font-medium tracking-normal px-1.5 py-0.2 rounded-xl text-[#b5e3c4]"
                        >
                          {step.time}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium text-[#f1f3ee] tracking-tight group-hover:text-[#f1f3ee] transition-colors">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-[#929b98] leading-relaxed ">
                    {step.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[#2b3031]">
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium tracking-normal text-[#f1f3ee]">
                        What to do
                      </h4>
                      <div className="space-y-2">
                        {step.steps.map((s, sIdx) => (
                          <div
                            key={`step-${step.id}-${sIdx}`}
                            className="flex items-start gap-2 text-sm leading-7 text-[#929b98]"
                          >
                            <span className="text-[#b5e3c4] font-medium shrink-0">
                              •
                            </span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-[#101214] border border-[#2b3031]">
                      <h4 className="text-xs font-medium tracking-normal text-[#929b98]">
                        Helpful tips
                      </h4>
                      <div className="space-y-2">
                        {step.tips.map((tip, tIdx) => (
                          <div
                            key={`tip-${step.id}-${tIdx}`}
                            className="flex items-start gap-2 text-sm leading-7 text-[#929b98]"
                          >
                            <CheckCircle
                              aria-hidden="true"
                              className="mt-1.5 size-3.5 shrink-0 text-[#b5e3c4]"
                            />
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
        <Card className="border border-[#2b3031] bg-[#b5e3c4]/5 rounded-xl p-6 text-center space-y-4">
          <div className="space-y-2">
            <div className="size-11 rounded-xl bg-[#b5e3c4]/10 border border-[#2b3031] flex items-center justify-center mx-auto text-[#b5e3c4]">
              <CheckCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-[#f1f3ee] tracking-normal">
                You’re ready to practice.
              </h2>
              <p className="text-sm text-[#929b98] max-w-sm mx-auto leading-relaxed">
                Start your first session, or explore your statistics to find
                your next focus.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-[#b5e3c4] hover:bg-[#ceedd8] text-[#101214] font-medium tracking-normal text-sm  transition-all font-sans"
              asChild
            >
              <Link href="/training">Start training</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-10 px-6 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-sm hover:bg-[#b5e3c4]/10 transition-all font-sans"
              asChild
            >
              <Link href="/statistics">View statistics</Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
