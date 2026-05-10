'use client';

import AdminLevelsManagement from "../_Components/AdminLevelsManagement";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminLevelsPage() {
  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 sm:p-12">
            <AdminLevelsManagement />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
