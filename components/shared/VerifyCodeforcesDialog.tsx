"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useUser } from "@/hooks/auth";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Shield,
  Clock,
  UserCheck,
  RotateCcw,
  ScrollText,
  KeyRound,
  Sparkles,
  Zap,
  Trophy,
  ArrowRight,
} from "lucide-react";
import StudioMascot from "./StudioMascot";
import { cn } from "@/lib/utils";

type Step = "intro" | "step1" | "step2" | "step3" | "success";

interface VerifyCodeforcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 150 : -150,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -150 : 150,
    opacity: 0,
  }),
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const XP_REWARD = 50;

function TimerBar({ pct, isLow }: { pct: number; isLow: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${pct}%`;
    }
  });

  return (
    <div
      ref={barRef}
      className={`h-full rounded-xl transition-all duration-1000 linear ${isLow ? "bg-red-500" : "bg-primary/90"}`}
    />
  );
}

const steps = [
  { icon: ScrollText, label: "Settings" },
  { icon: KeyRound, label: "Code" },
  { icon: ShieldCheck, label: "Verify" },
];

interface CountdownTimerProps {
  expiresAt: number | null;
  timerStartedAt: number | null;
  timeLeft: number;
}

const CountdownTimer = ({
  expiresAt,
  timerStartedAt,
  timeLeft,
}: CountdownTimerProps) => {
  if (!expiresAt || !timerStartedAt) return null;
  const totalDuration = Math.max(
    1,
    Math.ceil((expiresAt - timerStartedAt) / 1000),
  );
  const elapsed = Math.max(0, totalDuration - timeLeft);
  const pct = Math.max(
    0,
    Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100),
  );
  const isLow = timeLeft <= 60;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${isLow ? "text-red-400" : "text-primary"}`}
      >
        <Clock className="size-3" />
        <span>{formatTime(timeLeft)}</span>
      </div>
      <div className="w-16 h-1 rounded-xl bg-muted/40 border border-border overflow-hidden">
        <TimerBar pct={pct} isLow={isLow} />
      </div>
    </div>
  );
};

const VerifyCodeforcesDialog = ({
  isOpen,
  onClose,
}: VerifyCodeforcesDialogProps) => {
  const [step, setStep] = useState<Step>("intro");
  const [direction, setDirection] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const { generateVerificationCode, verifyCodeforcesProfile } = useUser();

  useEffect(() => {
    if (expiresAt && (step === "step2" || step === "step3")) {
      if (!timerStartedAt) {
        setTimerStartedAt(Date.now());
      }

      const tick = () => {
        const remaining = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      setTimeLeft(0);
    }
  }, [expiresAt, step, timerStartedAt]);

  const isExpired =
    expiresAt !== null &&
    timeLeft <= 0 &&
    step !== "intro" &&
    step !== "success";

  const navigateStep = useCallback(
    (next: Step) => {
      setDirection(
        ["intro", "step1", "step2", "step3", "success"].indexOf(next) >
          ["intro", "step1", "step2", "step3", "success"].indexOf(step)
          ? 1
          : -1,
      );
      setStep(next);
    },
    [step],
  );

  const handleStart = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateVerificationCode();
      if (res.success && res.data) {
        setVerificationCode(res.data.code);
        setExpiresAt(res.data.expiresAt);
        setTimerStartedAt(Date.now());
        navigateStep("step1");
      } else if (!res.success) {
        setError(res.error || "Failed to generate code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateVerificationCode();
      if (res.success && res.data) {
        setVerificationCode(res.data.code);
        setExpiresAt(res.data.expiresAt);
        setTimerStartedAt(Date.now());
        navigateStep("step2");
      } else if (!res.success) {
        setError(res.error || "Failed to generate code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await verifyCodeforcesProfile();
      if (res.success && res.data) {
        setXpAwarded(res.data.xpEarned);
        navigateStep("success");
      } else if (!res.success) {
        setError(res.error || "Verification failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = verificationCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setStep("intro");
    setVerificationCode("");
    setExpiresAt(null);
    setError(null);
    setCopied(false);
    setXpAwarded(null);
    onClose();
  };

  const currentStepIndex =
    step === "step1" ? 0 : step === "step2" ? 1 : step === "step3" ? 2 : -1;

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
        className="sm:max-w-lg border border-border bg-card p-0 font-sans text-foreground overflow-x-hidden overflow-y-auto shadow-none"
      >
        <VisuallyHidden>
          <DialogTitle>Verify your Codeforces profile</DialogTitle>
          <DialogDescription>
            Complete the verification steps to unlock all features and prove
            your Codeforces identity.
          </DialogDescription>
        </VisuallyHidden>

        {/* Verification progress */}
        {step !== "intro" && step !== "success" && (
          <div className="relative border-b border-border">
            <div className="h-0.5 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    step === "step1"
                      ? "33%"
                      : step === "step2"
                        ? "66%"
                        : "100%",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between px-6 py-2.5 bg-muted/40">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-primary" />
                <span className="text-xs font-medium   text-foreground">
                  Verify your profile
                </span>
              </div>
              {step === "step2" || step === "step3" ? (
                <CountdownTimer
                  expiresAt={expiresAt}
                  timerStartedAt={timerStartedAt}
                  timeLeft={timeLeft}
                />
              ) : (
                <span className="text-xs font-medium   text-primary">
                  Reward: +{XP_REWARD} XP
                </span>
              )}
            </div>
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 py-2 px-6 bg-background/30 border-t border-border">
              {steps.map((s, i) => {
                const isActive = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                return (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-medium  ",
                        isDone
                          ? "text-muted-foreground"
                          : isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {isDone ? "✓ " : `${i + 1}. `}
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <span className="text-muted-foreground font-medium">
                        &gt;
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6">
          <AnimatePresence mode="wait" custom={direction}>
            {/* INTRO STEP */}
            {step === "intro" && (
              <motion.div
                key="intro"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Introduction */}
                <div className="relative border border-border bg-muted/40 p-5 text-center rounded-xl">
                  <div className="relative space-y-3">
                    <div className="mx-auto size-11 rounded-xl bg-primary/5 border border-border flex items-center justify-center text-primary">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
                        Verify your profile
                      </h2>
                      <p className="text-xs text-muted-foreground   mt-1">
                        Prove your Codeforces identity and unlock features
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification steps */}
                <div className="space-y-1.5 text-xs  ">
                  <p className="font-medium text-muted-foreground">
                    {"Three quick steps"}
                  </p>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border">
                    <ScrollText className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Open your Codeforces profile settings
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border">
                    <KeyRound className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Paste a verification code in your first name
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border">
                    <ShieldCheck className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Verify and unlock your profile badge
                    </span>
                  </div>
                </div>

                {/* Rewards preview */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 text-xs  ">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-primary " />
                    <span className="font-medium text-foreground">
                      Verification reward
                    </span>
                  </div>
                  <span className="font-medium text-foreground">
                    +{XP_REWARD} XP &amp; verified badge
                  </span>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 text-xs   text-center">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleStart}
                  disabled={isGenerating}
                  className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                      <span>Preparing…</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center">
                      <Zap className="size-3.5" />
                      <span>Start verification</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === "step1" && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-medium ">
                  <button
                    onClick={() => navigateStep("intro")}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <span className="text-muted-foreground">Step 1 of 3</span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground">
                    Open Codeforces settings
                  </h3>
                  <p className="text-xs text-muted-foreground  max-w-xs mx-auto leading-relaxed">
                    Navigate to the following settings page while logged in to
                    Codeforces:
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs   transition-all shadow-none"
                  >
                    Open Codeforces settings
                    <ExternalLink className="size-3.5" />
                  </a>

                  <div className="text-center font-sans text-xs">
                    <a
                      href="https://codeforces.com/settings/social"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors underline decoration-border"
                    >
                      cf/settings/social
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground  leading-relaxed text-center">
                  {"This opens the public details on your Codeforces profile."}
                </div>

                <Button
                  onClick={() => navigateStep("step2")}
                  className="w-full h-10 rounded-xl border border-border bg-transparent text-primary font-medium   text-xs hover:bg-primary/10 transition-all font-sans"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <span>Continue</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </Button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === "step2" && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-medium ">
                  <button
                    onClick={() => navigateStep("step1")}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <span className="text-muted-foreground">Step 2 of 3</span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground">
                    Paste verification code
                  </h3>
                  <p className="text-xs text-muted-foreground  max-w-xs mx-auto leading-relaxed">
                    Edit the First Name input box on Codeforces and paste this
                    exact token:
                  </p>
                </div>

                {isExpired ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/20 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <Clock className="size-4 " />
                        <p className="text-xs font-medium  ">
                          Verification Code Expired
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground  leading-relaxed">
                        Codes expire after 2 minutes. Request a new code to
                        continue.
                      </p>
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 text-xs   text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>Creating code…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <RotateCcw className="size-3.5" />
                          <span>Get a new code</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Code display */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1">
                        <div className="flex-1 h-10 px-3 flex items-center font-sans text-base font-semibold  text-foreground">
                          {verificationCode}
                        </div>
                        <Button
                          variant="secondary"
                          onClick={handleCopy}
                          className="h-8 px-3 gap-1 rounded-xl font-medium text-xs   bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-primary" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground  leading-relaxed text-center">
                      This unique token proves profile ownership. You can
                      temporarily revert your settings after verification.
                    </p>

                    <Button
                      onClick={() => navigateStep("step3")}
                      disabled={isExpired}
                      className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                    >
                      <div className="flex items-center gap-1.5 justify-center">
                        <span>I have pasted the code</span>
                        <ArrowRight className="size-3.5" />
                      </div>
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === "step3" && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-medium ">
                  <button
                    onClick={() => navigateStep("step2")}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <span className="text-muted-foreground">Step 3 of 3</span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground">
                    Save settings &amp; verify
                  </h3>
                  <p className="text-xs text-muted-foreground  max-w-xs mx-auto leading-relaxed">
                    Make sure you hit the &quot;Save Changes&quot; button at the
                    bottom of the Codeforces settings page.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground   text-center">
                  {"Ready? Check your profile to finish."}
                </p>

                {isExpired ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/20 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <Clock className="size-4 " />
                        <p className="text-xs font-medium  ">
                          Verification Code Expired
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground  leading-relaxed">
                        Codes expire after 2 minutes. Request a new code to
                        continue.
                      </p>
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 text-xs   text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>Creating code…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <RotateCcw className="size-3.5" />
                          <span>Get a new code</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 text-xs   text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>Checking your profile…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <ShieldCheck className="size-4" />
                          <span>Verify profile</span>
                          <span className="text-xs text-primary-foreground/65 font-medium">
                            (+{XP_REWARD} XP)
                          </span>
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <motion.div
                key="success"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="text-center py-2 space-y-5"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto size-16 rounded-xl bg-primary/5 border border-border flex items-center justify-center text-primary shadow-none"
                  >
                    <ShieldCheck className="size-8 text-primary" />
                  </motion.div>
                </div>

                <StudioMascot pose="celebrate" className="mx-auto w-32" />
                <div className="space-y-1">
                  <p className="text-xs font-medium   text-muted-foreground">
                    {"Verification complete"}
                  </p>
                  <DialogTitle className="text-lg font-medium text-white  ">
                    Profile verified
                  </DialogTitle>
                </div>

                {xpAwarded !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground">
                    <Sparkles className="size-3.5 text-primary " />
                    <span>Earned: +{xpAwarded} XP</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground max-w-xs mx-auto  leading-relaxed">
                  Your Codeforces profile is connected. You’re ready to train,
                  track your progress, and join the community.
                </p>

                <Button
                  onClick={handleClose}
                  className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <UserCheck className="size-4" />
                    <span>Continue to your account</span>
                  </div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyCodeforcesDialog;
