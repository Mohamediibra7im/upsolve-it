import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variants map onto the design system's u-btn classes (app/globals.css).
const buttonVariants = cva("u-btn", {
  variants: {
    variant: {
      default: "u-btn--primary",
      destructive: "u-btn--danger",
      outline: "",
      secondary: "u-btn--ink",
      ghost: "u-btn--ghost",
      link: "h-auto border-0 bg-transparent p-0 t-link",
    },
    size: {
      default: "",
      sm: "u-btn--sm",
      lg: "u-btn--lg",
      icon: "u-btn--icon",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
