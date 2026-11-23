"use client";

import type React from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import StudioMascot from "@/components/shared/StudioMascot";
import Brand from "@/components/layout/Brand";

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
    <section
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-[#101214] px-5 py-8 font-sans text-[#f1f3ee] sm:px-8 sm:py-12",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" aria-label="Upsolve.it home">
            <Brand />
          </Link>
          {back && (
            <Link
              href={back.href}
              className="inline-flex items-center gap-2 rounded-lg text-xs text-[#929b98] transition-colors hover:text-[#f1f3ee]"
            >
              <ArrowLeft size={14} />
              {back.label}
            </Link>
          )}
        </div>
        <div className="overflow-hidden rounded-[24px] border border-[#2b3031] bg-[#191c1e]">
          <div className="grid lg:grid-cols-12">
            <div className="flex flex-col justify-between border-b border-[#2b3031] bg-[#1d2420] p-6 sm:p-8 lg:p-10 lg:col-span-5 lg:min-h-[36rem] lg:border-b-0 lg:border-r">
              <div>
                {icon && (
                  <div className="mb-8 hidden size-12 lg:flex items-center justify-center rounded-2xl border border-[#b5e3c4]/15 bg-[#b5e3c4]/10 text-[#b5e3c4] [&_svg]:text-[#b5e3c4]">
                    {icon}
                  </div>
                )}
                <h1 className="max-w-xs font-heading text-[30px] font-medium leading-[1.15] tracking-[-0.05em] sm:text-[36px] lg:text-[40px]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 max-w-[290px] text-[13px] leading-6 sm:mt-4 sm:text-sm text-[#a0aaa3]">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="mt-8 hidden lg:block">
                <StudioMascot pose="welcome" className="mb-5 w-36" />
                <div className="mb-6 space-y-3">
                  {[
                    "Find your next challenge",
                    "Build a consistent practice",
                    "See how far you have come",
                  ].map((benefit) => (
                    <p
                      key={benefit}
                      className="flex items-center gap-2.5 text-[13px] text-[#c1cbc3]"
                    >
                      <Check size={14} className="text-[#b5e3c4]" />
                      {benefit}
                    </p>
                  ))}
                </div>
                <p className="border-t border-[#b5e3c4]/10 pt-5 text-xs leading-5 text-[#829087]">
                  Connect with your Codeforces handle to bring your progress
                  into one place.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7 lg:p-12">
              <div className="w-full">{children}</div>
              {footer && (
                <div className="mt-7 border-t border-[#2b3031] pt-6">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="mt-7 text-center text-xs text-[#747e79]">
          A little more practice. A better problem solver.
        </p>
      </div>
    </section>
  );
}
