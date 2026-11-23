"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/features/auth";
import { useUser } from "@/hooks/auth";
import VerifyCodeforcesDialog from "./VerifyCodeforcesDialog";

const slab = {
  eyebrow: "Handle verification",
  statement: "Show the handle is yours.",
  points: [
    "Open your Codeforces profile settings",
    "Paste a short code into your first name",
    "Verify, then put your name back",
  ],
  current: 1,
  note: "It takes about two minutes.",
};

export default function VerificationRequired({
  children,
  isVerified,
}: {
  children: React.ReactNode;
  isVerified: boolean;
}) {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const { user, logout } = useUser();
  if (isVerified) return <>{children}</>;
  return (
    <main id="main-content" className="grid flex-1">
      <AuthSplit
        step="One step before you train"
        title="Verify your handle."
        lead={
          <>
            Your sessions, rating and upsolve queue belong to{" "}
            <b className="text-ink">
              {user?.codeforcesHandle ?? "your Codeforces handle"}
            </b>
            , so we check the handle is yours first. You add a short code to
            your Codeforces profile, we read it, and you take it off again.
          </>
        }
        slab={slab}
        footnote="We never ask for your Codeforces password."
      >
        <div className="grid gap-3">
          <Button size="lg" onClick={() => setShowVerifyDialog(true)}>
            Start verification
          </Button>
          <Button variant="ghost" onClick={logout}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </AuthSplit>
      <VerifyCodeforcesDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
      />
    </main>
  );
}
