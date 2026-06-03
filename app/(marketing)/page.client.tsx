"use client";

import {useUser} from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
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
  const {user, isLoading} = useUser();
  if (isLoading) return <Loader message="Loading..." />;

  return <GuestLandingPage user={user} />;
}
