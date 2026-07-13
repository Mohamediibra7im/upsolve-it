"use client";

import { AdminLogsView } from "@/components/features/admin";
import { m } from "framer-motion";

export default function AdminLogsClient() {
  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdminLogsView />
      </m.div>
    </div>
  );
}
