"use client";

import { usePathname, useRouter } from "next/navigation";
import {useUser} from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import VerificationRequired from "@/components/shared/VerificationRequired";

const protectedRoots = [
  "/dashboard",
  "/profile",
  "/training",
  "/statistics",
  "/upsolve",
  "/friends",
  "/roadmap",
  "/community",
  "/report",
];

const unauthedRoots = ["/", "/login", "/signup", "/reset-password"];

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

  // Handle loading state
  if (isLoading && isProtectedRoute) {
    return <Loader />;
  }

  // Redirect to home if not authenticated and trying to access protected route
  if (!isLoading && !user && isProtectedRoute) {
    router.push("/");
    return null; // Return null during redirect
  }

  // Block unverified users from all pages (except public/login pages)
  if (user && !user.isVerified && !isPublicRoute) {
    return (
      <VerificationRequired isVerified={false}>
        {children}
      </VerificationRequired>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
