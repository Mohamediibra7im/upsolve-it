"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { profileImageSrc } from "@/lib/profile-image";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-xl border border-border",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, onLoadingStatusChange, ...props }, ref) => {
  const source = typeof src === "string" ? profileImageSrc(src) : src;
  const [retry, setRetry] = React.useState({ source, attempt: 0 });
  const attempt = retry.source === source ? retry.attempt : 0;
  const [failedSource, setFailedSource] = React.useState<typeof src>();
  const currentSource = typeof source === "string" && source.startsWith("/api/profile-image?") && attempt
    ? `${source}&retry=${attempt}` : source;
  React.useEffect(() => {
    if (typeof source !== "string" || !source.startsWith("/api/profile-image?") || failedSource !== currentSource || attempt >= 2) return;
    const timer = window.setTimeout(() => setRetry({ source, attempt: attempt + 1 }), [2000, 10000][attempt]);
    return () => window.clearTimeout(timer);
  }, [source, currentSource, failedSource, attempt]);
  return <AvatarPrimitive.Image
    ref={ref}
    src={currentSource}
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
    onLoadingStatusChange={(status) => {
      setFailedSource(status === "error" ? currentSource : undefined);
      onLoadingStatusChange?.(status);
    }}
  />;
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex size-full items-center justify-center rounded-[inherit] bg-secondary text-sm font-medium text-primary",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarImage, AvatarFallback };
