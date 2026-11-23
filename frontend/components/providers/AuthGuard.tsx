"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import VerificationRequired from "@/components/shared/VerificationRequired";

const protectedRoots = [
  "/dashboard",
  "/profile",
  "/settings",
  "/training",
  "/statistics",
  "/upsolve",
  "/friends",
];

const unauthedRoots = [
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/email",
  "/modes",
  "/ladder",
  "/how-it-works",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/u",
];

// A signed-in visitor has no use for these: they go straight to the dashboard.
// The landing page stays open to them: the logo leads there.
const guestOnly = ["/login", "/signup"];

function routeIsProtected(pathname: string | null): boolean {
  if (!pathname) return false;
  return protectedRoots.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

function routeIsPublic(pathname: string | null): boolean {
  if (!pathname) return false;
  return unauthedRoots.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = routeIsProtected(pathname);
  const isPublicRoute = routeIsPublic(pathname);

  const shouldRedirect = !isLoading && !user && isProtectedRoute;

  const shouldEnterApp =
    !isLoading && !!user && guestOnly.includes(pathname ?? "");

  useEffect(() => {
    if (shouldRedirect) router.push("/");
    else if (shouldEnterApp) router.replace("/dashboard");
  }, [shouldRedirect, shouldEnterApp, router]);

  // Handle loading state
  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  // Return null while redirect is pending
  if (shouldRedirect) {
    return null;
  }
  if (shouldEnterApp) {
    return <Loader message="Opening your dashboard…" />;
  }

  // Block unverified users from all pages (except public/login pages)
  if (user && !user.isVerified && !isPublicRoute) {
    return (
      <VerificationRequired isVerified={false}>{children}</VerificationRequired>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
