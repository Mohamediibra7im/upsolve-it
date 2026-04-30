'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AdminUserManagement from "./_Components/AdminUserManagement";
import useUser from "@/hooks/useUser";
import { useAdminStats } from "@/hooks/useAdminStats";
import Loader from "@/app/_Components/Loader";
import { AnimatePresence, motion } from "framer-motion";

// Import modular components
import { AdminSidebar } from "./_Components/AdminSidebar";
import { AdminDashboardView } from "./_Components/AdminDashboardView";
import { AdminHeader } from "./_Components/AdminHeader";
import AdminLogsView from "./_Components/AdminLogsView";

type AdminTab = "dashboard" | "users" | "logs";

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { stats, isLoading: statsLoading, mutate: refreshStats } = useAdminStats();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!hasCheckedAuth) {
        setHasCheckedAuth(true);
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.role === "admin") {
              setIsAuthorized(true);
              return;
            }
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
        router.push("/");
      }
    }, 3000);

    if (!isLoading) {
      setHasCheckedAuth(true);
      if (user?.role !== "admin") {
        clearTimeout(timeoutId);
        router.push("/");
        return;
      }
      clearTimeout(timeoutId);
      setIsAuthorized(true);
    }

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, router, hasCheckedAuth]);

  if ((isLoading && !hasCheckedAuth) || (!isAuthorized && !hasCheckedAuth)) {
    return <Loader message="Establishing Secure Connection..." />;
  }

  if (hasCheckedAuth && (user?.role !== "admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background/50 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="w-full space-y-12">
          <AdminHeader 
            activeTab={activeTab}
            refreshStats={refreshStats}
            statsLoading={statsLoading}
          />

          {/* Views */}
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <AdminDashboardView 
                stats={stats}
                statsLoading={statsLoading}
              />
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden">
                  <div className="p-8 sm:p-12">
                    <AdminUserManagement />
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden">
                  <div className="p-8 sm:p-12">
                    <AdminLogsView />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
