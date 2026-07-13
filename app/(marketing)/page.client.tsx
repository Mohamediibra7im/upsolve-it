"use client";

import { useUser } from "@/hooks/auth";
import {
  HeroSection,
  FeaturesSection,
  GamifiedShowcase,
  CloseTheLoopSection,
  WorkflowSection,
  CommunitySection,
} from "@/components/features/landing";

/* ═══════════════════ PAGE ═══════════════════ */
function GuestLandingPage({ user }: { user: any }) {
  return (
    <div className="relative min-h-screen bg-[#040604] font-mono text-emerald-400 select-none overflow-hidden pb-16 [&_a]:font-mono [&_p]:font-mono [&_h1]:font-mono [&_h2]:font-mono [&_h3]:font-mono [&_span]:font-mono [&_button]:font-mono [&_.rounded-3xl]:rounded-sm [&_.rounded-2xl]:rounded-sm [&_.rounded-xl]:rounded-sm [&_.rounded-lg]:rounded-sm [&_.bg-card]:bg-[#060a08]/40 [&_.bg-card]:border-emerald-500/15 [&_.border]:border-emerald-500/15 [&_.text-muted-foreground]:text-emerald-500/45 [&_.text-foreground]:text-emerald-300 [&_.bg-clip-text]:bg-none [&_.bg-clip-text]:text-emerald-300 [&_h2]:text-emerald-300 [&_h3]:text-emerald-300">
      {/* Scanline pattern */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />
      
      <HeroSection user={user} />
      <FeaturesSection />
      <GamifiedShowcase />
      <CloseTheLoopSection />
      <WorkflowSection />
      <CommunitySection />
    </div>
  );
}

export default function RootPage() {
  const { user } = useUser();
  return <GuestLandingPage user={user} />;
}
