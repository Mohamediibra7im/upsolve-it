"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Terminal, Home, ArrowLeft, Cpu, ShieldAlert } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-[500px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20" />
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl px-4"
      >
        <div className="bg-card/30 backdrop-blur-3xl border border-border/40 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] w-full -translate-y-full animate-[scan_4s_linear_infinite] pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-8">
            {/* Icon Group */}
            <div className="relative">
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-primary/20 rounded-full"
              />
              <div className="size-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <ShieldAlert size={40} />
              </div>
            </div>

            <div className="space-y-4">
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Critical Status: 404
              </m.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Protocol<br />
                <span className="text-primary italic">Interrupted</span>
              </h1>
              <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm md:text-base leading-relaxed">
                The neural coordinates you are seeking do not exist in the current session. Navigation recalibration required.
              </p>
            </div>

            {/* Diagnostic Box */}
            <div className="w-full bg-black/40 rounded-2xl border border-border/20 p-4 font-mono text-[10px] text-left text-muted-foreground/60 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">[SYSTEM]</span>
                <span>Searching directory tree...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">[ERROR]</span>
                <span>Resource not found at target URI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">[TRACE]</span>
                <span>Route: {pathname}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-4">
              <Button asChild className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Home size={16} /> Return to Base
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => globalThis.history.back()}
                className="w-full h-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-card/40"
              >
                <ArrowLeft size={16} className="mr-2" /> Previous Link
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="mt-8 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Cpu size={14} className="text-muted-foreground/40" />
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Logic Core Alpha</span>
          </div>
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-muted-foreground/40" />
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Err: NULL_PTR</span>
          </div>
        </div>
      </m.div>
    </div>
  );
}
