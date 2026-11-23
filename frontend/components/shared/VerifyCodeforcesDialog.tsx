"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clock, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Countdown,
  FormError,
  VerificationCode,
} from "@/components/features/auth";
import { useUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";

const order = ["intro", "step1", "step2", "step3", "success"] as const;
type Step = (typeof order)[number];

const copy: Record<Step, { title: string; text: string }> = {
  intro: {
    title: "Verify your handle",
    text: "Show that the Codeforces handle on this account is yours. Log in to Codeforces before you start: the code only lasts a short time.",
  },
  step1: {
    title: "Open your Codeforces settings",
    text: "Log in to Codeforces and open the Social page of your settings. That is where your first name is.",
  },
  step2: {
    title: "Paste this code",
    text: "Set your First name on Codeforces to this code, then save the changes.",
  },
  step3: {
    title: "Save, then verify",
    text: "Check that you pressed Save changes on the Codeforces settings page. We will look for the code on your profile.",
  },
  success: {
    title: "Handle verified",
    text: "Your Codeforces profile is connected. You can put your first name back and start training.",
  },
};

const introSteps = [
  "Open your Codeforces profile settings",
  "Paste a short code into your first name and save",
  "Verify here, then put your name back",
];

interface VerifyCodeforcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerifyCodeforcesDialog = ({
  isOpen,
  onClose,
}: VerifyCodeforcesDialogProps) => {
  const [step, setStep] = useState<Step>("intro");
  const [verificationCode, setVerificationCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const { generateVerificationCode, verifyCodeforcesProfile } = useUser();

  useEffect(() => {
    if (expiresAt === null) return;
    const timer = setInterval(
      () =>
        setTimeLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(timer);
  }, [expiresAt]);

  const stepNumber = order.indexOf(step);
  const inSteps = stepNumber >= 1 && stepNumber <= 3;
  const isExpired = expiresAt !== null && timeLeft <= 0 && inSteps;

  const goTo = (next: Step) => {
    setError(null);
    setStep(next);
  };

  const requestCode = async (next: Step) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateVerificationCode();
      if (res.success && res.data) {
        setVerificationCode(res.data.code);
        setExpiresAt(res.data.expiresAt);
        setTimeLeft(
          Math.max(0, Math.ceil((res.data.expiresAt - Date.now()) / 1000)),
        );
        goTo(next);
      } else if (!res.success) {
        setError(res.error || "We could not create a code. Try again.");
      }
    } catch {
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await verifyCodeforcesProfile();
      if (res.success) setStep("success");
      else
        setError(
          res.error ||
            "We could not find the code on your profile. Save it on Codeforces, then verify again.",
        );
    } catch {
      setError("We could not reach the server. Verify again in a minute.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep("intro");
    setVerificationCode("");
    setExpiresAt(null);
    setError(null);
    onClose();
  };

  const newCode = isGenerating ? "Creating your code…" : null;
  const action = isExpired
    ? {
        label: newCode ?? "Get a new code",
        run: () => requestCode("step2"),
        busy: isGenerating,
      }
    : {
        intro: {
          label: newCode ?? "Start verification",
          run: () => requestCode("step1"),
          busy: isGenerating,
        },
        step1: { label: "Show my code", run: () => goTo("step2"), busy: false },
        step2: {
          label: "I have saved the code",
          run: () => goTo("step3"),
          busy: false,
        },
        step3: {
          label: isVerifying ? "Checking your profile…" : "Verify profile",
          run: handleVerify,
          busy: isVerifying,
        },
        success: { label: "Continue", run: handleClose, busy: false },
      }[step];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={() => {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current?.isConnected) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
        className="gap-5 sm:max-w-md"
      >
        <DialogHeader className="pr-8 text-left">
          <p className="t-eyebrow">
            {inSteps ? `Step ${stepNumber} of 3` : "Handle verification"}
          </p>
          <DialogTitle className="t-h2">{copy[step].title}</DialogTitle>
          <DialogDescription className="t-muted">
            {copy[step].text}
          </DialogDescription>
        </DialogHeader>

        {step === "intro" && (
          <ol className="grid gap-3">
            {introSteps.map((text, i) => (
              <li key={text} className="flex items-center gap-3">
                <span className="u-step">{i + 1}</span>
                {text}
              </li>
            ))}
          </ol>
        )}

        {step === "step1" && (
          <a
            href="https://codeforces.com/settings/social"
            target="_blank"
            rel="noopener noreferrer"
            className="u-btn"
          >
            Open Codeforces settings
            <ExternalLink aria-hidden="true" />
          </a>
        )}

        {isExpired ? (
          <div className="u-panel u-panel--sunk grid gap-2 p-4">
            <Badge variant="pending" className="justify-self-start">
              <Clock />
              Code expired
            </Badge>
            <p className="t-muted">
              The code ran out of time. Get a new one to continue.
            </p>
          </div>
        ) : (
          <>
            {step === "step2" && (
              <>
                <VerificationCode
                  code={verificationCode}
                  secondsLeft={timeLeft}
                />
                <p className="t-sm t-muted">
                  The code shows the handle is yours. You can put your first
                  name back as soon as it is verified.
                </p>
              </>
            )}
            {(step === "step1" || step === "step3") && (
              <div className="u-panel u-panel--sunk flex items-center justify-between gap-3 px-4 py-3">
                <span className="t-eyebrow">Time left</span>
                <Countdown secondsLeft={timeLeft} />
              </div>
            )}
          </>
        )}

        {step === "success" && (
          <Badge variant="solved" className="justify-self-start">
            <Check />
            Verified
          </Badge>
        )}

        {error && <FormError>{error}</FormError>}

        <div
          className={cn(
            "flex flex-col-reverse gap-2 sm:flex-row",
            inSteps ? "sm:justify-between" : "sm:justify-end",
          )}
        >
          {inSteps && (
            <Button variant="ghost" onClick={() => goTo(order[stepNumber - 1])}>
              <ArrowLeft />
              Back
            </Button>
          )}
          <Button onClick={action.run} disabled={action.busy}>
            {action.label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyCodeforcesDialog;
