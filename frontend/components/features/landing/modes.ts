import {
  Flame,
  Focus,
  Layers3,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** The five training modes as the public pages describe them. The numbers
 *  mirror services/training/modeRatings.ts; `window` is the rating range a set
 *  is drawn from, relative to your own rating. */
export const MODES: {
  id: string;
  name: string;
  icon: LucideIcon;
  set: string;
  minutes: string;
  purpose: string;
  detail: string;
  window?: [from: number, to: number];
}[] = [
  {
    id: "ladder",
    name: "Ladder",
    icon: Layers3,
    set: "4",
    minutes: "120",
    purpose: "Build confidence, one level at a time.",
    detail: "Climb across 110 levels, target ratings 900–4050.",
  },
  {
    id: "weakness",
    name: "Weakness",
    icon: Focus,
    set: "4",
    minutes: "120",
    purpose: "Give your challenging topics more attention.",
    detail:
      "Topics where your past sessions left problems unsolved or solved slowly.",
  },
  {
    id: "speed",
    name: "Speed round",
    icon: Zap,
    set: "4",
    minutes: "52",
    purpose: "Find your rhythm with a shorter, faster session.",
    detail: "A shorter set, 400 to 100 below your rating.",
    window: [-400, -100],
  },
  {
    id: "contest",
    name: "Contest",
    icon: Trophy,
    set: "4",
    minutes: "120",
    purpose: "Practice under pressure, with ratings hidden.",
    detail: "200 either side of your rating, ratings and details hidden.",
    window: [-200, 200],
  },
  {
    id: "endurance",
    name: "Endurance",
    icon: Flame,
    set: "6–8",
    minutes: "180–240",
    purpose: "Settle in and strengthen your staying power.",
    detail: "Extended sets within 100 of your current rating.",
    window: [-100, 100],
  },
];
