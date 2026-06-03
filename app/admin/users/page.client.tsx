"use client";

import { AdminUserManagement } from "@/components/features/admin";
import { Card } from "@/components/ui/card";
import { m } from "framer-motion";

export default function AdminUsersClient() {
  return (
    <div className="space-y-6">

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 sm:p-12">
            <AdminUserManagement />
          </div>
        </Card>
      </m.div>
    </div>
  );
}
