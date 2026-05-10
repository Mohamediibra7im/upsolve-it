'use client';

import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { AdminDashboardView } from "../_Components/AdminDashboardView";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdminDashboardView 
          stats={stats}
          statsLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}
