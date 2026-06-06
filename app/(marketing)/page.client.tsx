"use client";

import {useUser} from "@/hooks/auth";
import {
  HeroSection,
  FeaturesSection,
  GamifiedShowcase,
  CloseTheLoopSection,
  WorkflowSection,
  CommunitySection,
} from "@/components/features/landing";

/* ═══════════════════ PAGE ═══════════════════ */
function GuestLandingPage({user}: {user: any}) {
  return (
    <div className="relative min-h-screen">
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
  const {user} = useUser();
  return <GuestLandingPage user={user} />;
}
