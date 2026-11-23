"use client";

import { getPasswordStrengthLevel } from "@/utils/passwordValidation";
import { cn } from "@/lib/utils";

const levels = {
  weak: { label: "Weak", value: 1, bar: "bg-failed", text: "text-failed" },
  fair: { label: "Fair", value: 2, bar: "bg-pending", text: "text-pending" },
  good: { label: "Good", value: 3, bar: "bg-solved", text: "text-solved" },
  strong: { label: "Strong", value: 4, bar: "bg-solved", text: "text-solved" },
};

/** Four segments and always the word beside them: colour never stands alone. */
export function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;
  const level = levels[getPasswordStrengthLevel(password)];

  return (
    <div
      role="meter"
      aria-label="Password strength"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={level.value}
      aria-valuetext={level.label}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4].map((segment) => (
        <i
          key={segment}
          className={cn(
            "h-1 flex-1 rounded-sm",
            segment <= level.value ? level.bar : "bg-surface-sunk",
          )}
        />
      ))}
      <span className={cn("t-sm ml-2 w-12 font-semibold", level.text)}>
        {level.label}
      </span>
    </div>
  );
}
