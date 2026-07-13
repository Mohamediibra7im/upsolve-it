"use client";

import { AdminLevelsManagement } from "@/components/features/admin";
import { m } from "framer-motion";

export default function AdminLevelsClient() {
  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdminLevelsManagement />
      </m.div>
    </div>
  );
}
