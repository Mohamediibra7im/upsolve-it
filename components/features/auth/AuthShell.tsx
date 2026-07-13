"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  back?: { href: string; label: string };
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function AuthShell({
  title,
  subtitle,
  icon,
  back,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <section className={cn("relative w-full font-mono text-emerald-400 bg-[#040604] py-8 min-h-[calc(100vh-4rem)] flex items-center justify-center select-none", className)}>
      {/* Background terminal grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />

      <div className="mx-auto w-full max-w-4xl px-4 relative z-10">
        {back ? (
          <Link
            href={back.href}
            className="mb-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500/60 hover:text-emerald-300 transition-colors"
          >
            [ {back.label.toUpperCase().replace(/ /g, "_")} ]
          </Link>
        ) : null}

        <Card className="overflow-hidden rounded-sm border border-emerald-500/20 bg-[#060a08]/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="grid lg:grid-cols-12 font-mono">
            {/* Left Console Panel */}
            <div className="relative lg:col-span-5 border-b lg:border-b-0 lg:border-r border-emerald-500/15">
              <div className="relative p-6 sm:p-8 lg:min-h-[30rem] flex flex-col justify-between h-full bg-emerald-950/[0.02]">
                <div className="space-y-6">
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2 text-[8px] text-emerald-500/35 font-bold uppercase tracking-widest">
                    <span>SYS_ACCESS // PORTAL</span>
                    <span>ACTIVE</span>
                  </div>

                  {icon ? (
                    <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      {icon}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <h1 className="text-xl font-bold uppercase tracking-wide text-white leading-none">
                      {title}
                    </h1>
                    {subtitle ? (
                      <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8 hidden lg:block">
                  <div className="rounded-sm border border-emerald-500/10 bg-[#040604]/60 p-3.5">
                    <p className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-wider">
                      {"// SYSTEM_COMPATIBILITY_INFO"}
                    </p>
                    <p className="mt-1.5 text-[9px] leading-relaxed text-emerald-500/60 uppercase">
                      Use the same handle as your <span className="text-emerald-300 font-bold">codeforces.com</span> profile so your progress sync works instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <CardContent className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between min-h-[30rem]">
              <div className="w-full">
                {children}
              </div>
              {footer ? <div className="mt-6 pt-4 border-t border-emerald-500/10">{footer}</div> : null}
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
