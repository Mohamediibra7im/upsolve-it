"use client";

import {
  Achievements,
  isEarned,
} from "@/components/features/profile/Achievements";
import { useProfileData } from "@/components/features/profile/useProfileData";

export default function ProfileAchievementsPage() {
  const { user, achievements } = useProfileData();
  if (!user) return null;

  return (
    <>
      <p className="t-muted">
        <span className="t-num">
          {achievements.filter(isEarned).length} of {achievements.length}
        </span>{" "}
        earned
      </p>
      <Achievements items={achievements} className="lg:grid-cols-3" />
    </>
  );
}
