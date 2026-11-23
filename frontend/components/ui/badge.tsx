import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Variants map onto the design system's u-badge classes. A state badge always
// carries a word (and usually an icon): colour never stands alone.
const badgeVariants = cva("u-badge", {
  variants: {
    variant: {
      default: "",
      secondary: "",
      outline: "u-badge--line",
      line: "u-badge--line",
      accent: "u-badge--accent",
      solved: "u-badge--solved",
      failed: "u-badge--failed",
      destructive: "u-badge--failed",
      pending: "u-badge--pending",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
