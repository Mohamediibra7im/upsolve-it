"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <section className={cn("relative w-full", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.045]" />
        <div className="absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-[26rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {back ? (
          <Link
            href={back.href}
            className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {back.label}
          </Link>
        ) : null}

        <Card className="overflow-hidden rounded-3xl border-2 border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="p-0" />
          <div className="grid lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/10 to-accent/15" />
              <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(40rem_25rem_at_50%_20%,black,transparent)] bg-grid-pattern" />
              <div className="relative p-6 sm:p-10 lg:min-h-[32rem]">
                {icon ? (
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/15">
                    <div className="text-primary-foreground">{icon}</div>
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="mt-7 hidden lg:block">
                  <div className="rounded-2xl border border-border/60 bg-background/40 p-4 backdrop-blur">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Tip
                    </p>
                    <p className="mt-1 text-sm text-foreground/90">
                      Use the same handle as your{" "}
                      <span className="font-semibold">codeforces.com</span>{" "}
                      profile so your progress sync works instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="lg:col-span-7 p-6 sm:p-10">
              {children}
              {footer ? <div className="mt-8">{footer}</div> : null}
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}








