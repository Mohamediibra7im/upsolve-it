"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerifyCodeforcesDialog from "./VerifyCodeforcesDialog";
import Brand from "@/components/layout/Brand";

export default function VerificationRequired({
  children,
  isVerified,
}: {
  children: React.ReactNode;
  isVerified: boolean;
}) {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  if (isVerified) return <>{children}</>;
  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex">
          <Brand />
        </Link>
        <section className="rounded-3xl border border-border bg-card p-7 sm:p-9">
          <span className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={25} />
          </span>
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            Make your profile yours.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Verify your Codeforces handle to connect your practice and unlock
            your account.
          </p>
          <ol className="my-7 space-y-5">
            {[
              "Open your Codeforces profile settings.",
              "Add a verification code to your first name.",
              "Verify your profile, then restore your name.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-6">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mb-6 rounded-xl bg-primary/5 px-4 py-3 text-xs text-primary">
            Earn 50 XP and a verified profile badge.
          </div>
          <Button
            onClick={() => setShowVerifyDialog(true)}
            className="h-12 w-full rounded-xl"
          >
            Start verification <ArrowRight size={16} />
          </Button>
        </section>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>
      <VerifyCodeforcesDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
      />
    </main>
  );
}
