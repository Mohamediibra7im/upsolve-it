import type { ReactNode } from "react";
import ProfileFrame from "@/components/features/profile/ProfileFrame";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfileFrame>{children}</ProfileFrame>;
}
