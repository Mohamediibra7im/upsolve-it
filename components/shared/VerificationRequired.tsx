"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Trophy,
  Sparkles,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";
import VerifyCodeforcesDialog from "./VerifyCodeforcesDialog";

interface VerificationRequiredProps {
  children: React.ReactNode;
  isVerified: boolean;
}

const VerificationRequired = ({
  children,
  isVerified,
}: VerificationRequiredProps) => {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  if (isVerified) {
    return <>{children}</>;
  }

  // ponytail: don't mount children behind overlay — they fire API calls that 401 → logout
  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none blur-[6px] opacity-30">
          <div className="min-h-screen" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-start pt-32 sm:pt-40 justify-center bg-background/70 backdrop-blur-sm rounded-xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-20 left-1/4 size-64 rounded-full bg-accent/5 blur-[80px]" />
          </div>

          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <Card className="max-w-sm mx-4 border-border/60 bg-card/95 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative p-6 pb-4 text-center">
                  <m.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 mb-4"
                  >
                    <Shield className="size-7 text-primary-foreground" />
                  </m.div>

                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3"
                  >
                    <Lock className="size-3 mr-1" />
                    Account Locked
                  </Badge>

                  <h3 className="text-xl font-black tracking-tight">
                    Verify to Continue
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                    Verify your Codeforces profile to unlock the full
                    experience.
                  </p>
                </div>
              </div>

              <CardContent className="p-6 pt-2 space-y-4">
                {/* Steps */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    How it works
                  </p>
                  {[
                    "Open your Codeforces profile settings",
                    "Paste a verification code in your first name",
                    "Verify and unlock your badge",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <div className="flex-shrink-0 size-6 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-[10px] font-black text-primary">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reward */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex-shrink-0 size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Trophy className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">Reward</p>
                    <p className="text-[10px] text-muted-foreground">
                      +50 XP &amp; Verified Badge
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="size-3 text-primary" />
                    <span className="text-xs font-black text-primary">+50</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowVerifyDialog(true)}
                  className="w-full h-12 text-sm font-black bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20 tracking-wide"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    Start Verification
                    <ArrowRight className="size-4" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          </m.div>
        </div>
      </div>

      <VerifyCodeforcesDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
      />
    </>
  );
};

export default VerificationRequired;
