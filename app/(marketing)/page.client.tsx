"use client";

import { useUser } from "@/hooks/auth";
import HeroSection from "@/components/features/landing/HeroSection";
import FeaturesSection from "@/components/features/landing/FeaturesSection";
import WorkflowSection from "@/components/features/landing/WorkflowSection";
import CommunitySection from "@/components/features/landing/CommunitySection";
import styles from "@/components/features/landing/landing.module.css";

export default function RootPage() {
  const { user } = useUser();
  return (
    <div className={styles.landing}>
      <div className={styles.container}>
        <HeroSection user={user} />
        <FeaturesSection signedIn={!!user} />
        <WorkflowSection />
        <CommunitySection signedIn={!!user} />
      </div>
    </div>
  );
}
