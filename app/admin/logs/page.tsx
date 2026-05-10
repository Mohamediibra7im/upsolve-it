'use client';

import AdminLogsView from "../_Components/AdminLogsView";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 sm:p-12">
            <AdminLogsView />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
