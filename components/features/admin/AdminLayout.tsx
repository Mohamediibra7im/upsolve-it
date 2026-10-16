"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Bell,
  Users,
  Shield,
  Settings,
  Home,
  MailQuestion,
} from "lucide-react";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";

const adminPages = [
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Manage system notifications",
  },
  {
    href: "/admin/contact",
    label: "Contact Messages",
    icon: MailQuestion,
    description: "View and manage support messages",
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    description: "Manage user roles and permissions",
  },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
        return;
      }

      if (user.role !== "admin") {
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101214] text-[#f1f3ee]">
      <div className="container mx-auto p-6 space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#b5e3c4]/10 text-[#b5e3c4]">
                <Crown className="size-6 text-[#b5e3c4]" />
              </div>
              <div>
                <h1 className="text-4xl font-medium font-heading tracking-[-0.04em]">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground">
                  Manage your application with advanced controls
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild className="space-x-2">
              <Link href="/">
                <Home className="size-4" />
                <span>Back to App</span>
              </Link>
            </Button>
            <Badge className="bg-[#b5e3c4]/10 text-[#b5e3c4] px-3 py-1">
              <Shield className="size-3 mr-1" />
              Admin
            </Badge>
          </div>
        </div>

        {/* Admin Navigation */}
        <Card className="shadow-none rounded-[20px] border border-[#2b3031] bg-[#191c1e]">
          <CardHeader className="">
            <CardTitle className="flex items-center space-x-2 font-heading tracking-tight">
              <Settings className="size-5" />
              <span>Quick Navigation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {adminPages.map((page) => {
                const Icon = page.icon;
                const isActive = pathname === page.href;
                return (
                  <Button
                    key={page.href}
                    variant={isActive ? "default" : "outline"}
                    asChild
                    className={`h-auto p-4 justify-start ${
                      isActive ? "bg-[#b5e3c4] text-[#14241b] border-0" : ""
                    }`}
                  >
                    <Link
                      href={page.href}
                      className="flex items-center space-x-3 w-full"
                    >
                      <Icon className="size-5" />
                      <div className="min-w-0 text-left">
                        <div className="font-semibold">{page.label}</div>
                        <div
                          className={`text-sm ${isActive ? "text-[#14241b]/80" : "text-muted-foreground"}`}
                        >
                          {page.description}
                        </div>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Page Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
