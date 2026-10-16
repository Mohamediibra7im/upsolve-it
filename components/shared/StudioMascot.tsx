import Image from "next/image";
import { cn } from "@/lib/utils";

export type MascotPose =
  "welcome" | "focus" | "learn" | "celebrate" | "think" | "climb" | "rest";

/** Decorative artwork stays out of the accessibility tree and never intercepts controls. */
export default function StudioMascot({
  pose = "welcome",
  className,
  priority = false,
}: {
  pose?: MascotPose;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={`/images/mascot/${pose}.png`}
      alt=""
      aria-hidden="true"
      width={1280}
      height={1280}
      sizes="(max-width: 640px) 128px, 240px"
      priority={priority}
      draggable={false}
      className={cn(
        "pointer-events-none h-auto select-none object-contain",
        className,
      )}
    />
  );
}
