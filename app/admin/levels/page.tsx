'use client';

import AdminLevelsManagement from "../_Components/AdminLevelsManagement";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLevelsPage() {
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operational Status: Optimal</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground leading-none">
            Level Distribution
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl opacity-70">
            Define training level targets; problem ratings P1–P4 follow the ladder formula from each target.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
          <div className="p-8 sm:p-12">
            <AdminLevelsManagement />
          </div>
        </Card>
      </motion.div>
    </>
  );
}
