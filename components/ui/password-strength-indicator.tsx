"use client";

import { getPasswordStrengthLevel } from "@/utils/passwordValidation";
import { cn } from "@/lib/utils";

const strengthLevels = {
  weak: {
    label: "Weak",
    value: 1,
    color: "bg-destructive",
    text: "text-red-300",
  },
  fair: {
    label: "Fair",
    value: 2,
    color: "bg-amber-400/80",
    text: "text-amber-300",
  },
  good: {
    label: "Good",
    value: 3,
    color: "bg-primary/65",
    text: "text-primary",
  },
  strong: {
    label: "Strong",
    value: 4,
    color: "bg-primary",
    text: "text-primary",
  },
};

export function PasswordStrengthIndicator({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  if (!password) return null;
  const strength = strengthLevels[getPasswordStrengthLevel(password)];

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn("font-medium", strength.text)}>
          {strength.label}
        </span>
      </div>
      <div
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength.value}
        aria-valuetext={strength.label}
        className="grid grid-cols-4 gap-1.5"
      >
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 rounded-full transition-colors",
              segment <= strength.value ? strength.color : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
