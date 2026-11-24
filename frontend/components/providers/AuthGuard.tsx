"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth";
import { signupStep } from "@/utils/signupStep";
import Loader from "@/components/shared/Loader";

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

  // An account that stopped part-way through sign-up is sent back to the
  // step it left, from the app and from the login page alike.
  const midSignup = !isLoading && !!user && signupStep(user) > 0;
  const shouldFinishSignup =
    midSignup && (!isPublicRoute || pathname === "/login");

  const shouldEnterApp =
    !isLoading && !!user && !midSignup && guestOnly.includes(pathname ?? "");

  useEffect(() => {
    if (shouldRedirect) router.push("/");
    else if (shouldFinishSignup) router.replace("/signup");
    else if (shouldEnterApp) router.replace("/dashboard");
  }, [shouldRedirect, shouldFinishSignup, shouldEnterApp, router]);

  // Handle loading state
  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  // Return null while redirect is pending
  if (shouldRedirect) {
    return null;
  }
  if (shouldFinishSignup) {
    return <Loader message="Back to your sign-up…" />;
  }
  if (shouldEnterApp) {
    return <Loader message="Opening your dashboard…" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
