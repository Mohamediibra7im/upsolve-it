"use client";

import {useState, useCallback, useEffect, useRef} from "react";
import {m, AnimatePresence} from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {useUser} from "@/hooks/auth";
import {
  ArrowLeft,
  Check,
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

type Step = "intro" | "step1" | "step2" | "step3" | "success";

interface VerifyCodeforcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {x: 0, opacity: 1, scale: 1},
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
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
      className={`h-full rounded-full transition-all duration-1000 linear ${isLow ? "bg-destructive" : "bg-primary"}`}
    />
  );
}

const steps = [
  {icon: ScrollText, label: "Open Settings"},
  {icon: KeyRound, label: "Paste Code"},
  {icon: ShieldCheck, label: "Verify"},
];

interface CountdownTimerProps {
  expiresAt: number | null;
  timerStartedAt: number | null;
  timeLeft: number;
}

const CountdownTimer = ({ expiresAt, timerStartedAt, timeLeft }: CountdownTimerProps) => {
  if (!expiresAt || !timerStartedAt) return null;
  const totalDuration = Math.max(1, Math.ceil((expiresAt - timerStartedAt) / 1000));
  const elapsed = Math.max(0, totalDuration - timeLeft);
  const pct = Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100));
  const isLow = timeLeft <= 60;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 text-xs font-bold ${isLow ? "text-destructive" : "text-primary"}`}>
        <Clock className="size-3" />
        <span>{formatTime(timeLeft)}</span>
      </div>
      <div className="w-20 h-1.5 rounded-full bg-muted/50 overflow-hidden">
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

  const {generateVerificationCode, verifyCodeforcesProfile} = useUser();

  useEffect(() => {
    if (expiresAt && (step === "step2" || step === "step3")) {
      // Record when this timer session started (only once per code generation)
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
  }, [expiresAt, step]);

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
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Verify your Codeforces profile</DialogTitle>
          <DialogDescription>
            Complete the verification quest to unlock all features and prove your Codeforces identity.
          </DialogDescription>
        </VisuallyHidden>

        {/* Quest header bar */}
        {step !== "intro" && step !== "success" && (
          <div className="relative">
            <div className="h-1 bg-muted/50">
              <m.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{width: "0%"}}
                animate={{
                  width:
                    step === "step1"
                      ? "33%"
                      : step === "step2"
                        ? "66%"
                        : "100%",
                }}
                transition={{duration: 0.4, ease: "easeOut"}}
              />
            </div>
            <div className="flex items-center justify-between px-6 py-3 pr-14 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  Verification Quest
                </span>
              </div>
              {step === "step2" || step === "step3" ? (
                <CountdownTimer expiresAt={expiresAt} timerStartedAt={timerStartedAt} timeLeft={timeLeft} />
              ) : (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary text-[10px] font-bold gap-1"
                >
                  <Trophy className="size-3" />+{XP_REWARD} XP
                </Badge>
              )}
            </div>
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 pb-3 px-6">
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                return (
                  <div key={s.label} className="flex items-center gap-1">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
                        isDone
                          ? "bg-primary/20 text-primary"
                          : isActive
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <StepIcon className="size-3" />
                      )}
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-4 h-px ${isDone ? "bg-primary/40" : "bg-muted/30"}`}
                      />
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
              <m.div
                key="intro"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{duration: 0.3, ease: "easeInOut"}}
              >
                {/* Quest banner */}
                <div className="relative mb-6 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="relative p-6 text-center">
                    <m.div
                      initial={{scale: 0, rotate: -180}}
                      animate={{scale: 1, rotate: 0}}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                      }}
                      className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 mb-4"
                    >
                      <Shield className="size-8 text-primary-foreground" />
                    </m.div>
                    <h2 className="text-xl font-black tracking-tight">
                      Verification Quest
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prove your Codeforces identity and earn rewards
                    </p>
                  </div>
                </div>

                {/* Quest objectives */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Quest Objectives
                  </p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex-shrink-0 size-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ScrollText className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Open your Codeforces profile settings
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex-shrink-0 size-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <KeyRound className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Paste a verification code in your first name
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex-shrink-0 size-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Verify and unlock your badge
                    </span>
                  </div>
                </div>

                {/* Rewards preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
                  <div className="flex-shrink-0 size-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Trophy className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Reward</p>
                    <p className="text-xs text-muted-foreground">
                      +{XP_REWARD} XP &amp; Verified Badge
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs font-bold"
                  >
                    <Sparkles className="size-3 mr-1" />+{XP_REWARD}
                  </Badge>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive text-center">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleStart}
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-black bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20 tracking-wide"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Initializing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="size-4" />
                      Start Quest
                    </div>
                  )}
                </Button>
              </m.div>
            )}

            {/* STEP 1 */}
            {step === "step1" && (
              <m.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{duration: 0.3, ease: "easeInOut"}}
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateStep("intro")}
                    className="gap-1 text-muted-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs font-bold"
                  >
                    Objective 1/3
                  </Badge>
                </div>

                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-bold text-center">
                    Open your Codeforces profile settings
                  </DialogTitle>
                  <DialogDescription className="text-center text-muted-foreground">
                    Navigate to the following page while logged in to
                    Codeforces:
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                  <a
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/20"
                  >
                    Open Codeforces Settings
                    <ExternalLink className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                <div className="mt-3 text-center">
                  <a
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    https://codeforces.com/settings/social
                  </a>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground text-center">
                    This is where you can edit your profile details.
                  </p>
                </div>

                <Button
                  onClick={() => navigateStep("step2")}
                  className="mt-4 w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <div className="flex items-center gap-2">
                    Continue Quest
                    <ArrowRight className="size-4" />
                  </div>
                </Button>
              </m.div>
            )}

            {/* STEP 2 */}
            {step === "step2" && (
              <m.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{duration: 0.3, ease: "easeInOut"}}
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateStep("step1")}
                    className="gap-1 text-muted-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs font-bold"
                  >
                    Objective 2/3
                  </Badge>
                </div>

                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-bold text-center">
                    Paste the verification code
                  </DialogTitle>
                  <DialogDescription className="text-center text-muted-foreground">
                    Edit the First Name section on Codeforces and paste this
                    code:
                  </DialogDescription>
                </DialogHeader>

                {isExpired ? (
                  <div className="mt-6 text-center space-y-4">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="size-5 text-destructive" />
                        <p className="text-sm font-bold text-destructive">
                          Code Expired
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Verification codes expire after 1 minutes for security.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">
                          {error}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RotateCcw className="size-4" />
                          Regenerate Code
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Code display */}
                    <div className="mt-6 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-sm" />
                      <div className="relative flex items-center gap-2 bg-card border border-border/50 rounded-xl p-1">
                        <div className="flex-1 h-12 px-4 flex items-center font-mono text-xl font-black tracking-[0.3em] text-primary">
                          {verificationCode}
                        </div>
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={handleCopy}
                          className="h-10 px-4 gap-2 rounded-lg font-bold"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="size-4 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      This code proves you own this Codeforces account. You can
                      temporarily replace your first name with it.
                    </p>

                    <Button
                      onClick={() => navigateStep("step3")}
                      disabled={isExpired}
                      className="mt-4 w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      <div className="flex items-center gap-2">
                        I&apos;ve pasted the code
                        <ArrowRight className="size-4" />
                      </div>
                    </Button>
                  </>
                )}
              </m.div>
            )}

            {/* STEP 3 */}
            {step === "step3" && (
              <m.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{duration: 0.3, ease: "easeInOut"}}
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateStep("step2")}
                    className="gap-1 text-muted-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs font-bold"
                  >
                    Final Step
                  </Badge>
                </div>

                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-bold text-center">
                    Save &amp; Complete the Quest
                  </DialogTitle>
                  <DialogDescription className="text-center text-muted-foreground">
                    Make sure you saved your Codeforces profile after pasting
                    the verification code.
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Click verify to claim your reward.
                </p>

                {isExpired ? (
                  <div className="mt-4 text-center space-y-4">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="size-5 text-destructive" />
                        <p className="text-sm font-bold text-destructive">
                          Code Expired
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Verification codes expire after 1 minutes for security.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">
                          {error}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RotateCcw className="size-4" />
                          Regenerate Code
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">
                          {error}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="mt-4 w-full h-14 text-base font-black bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground shadow-xl shadow-primary/25 tracking-wide"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-5" />
                          Complete Quest
                          <Badge
                            variant="outline"
                            className="border-white/30 text-white text-[10px] font-bold ml-1"
                          >
                            +{XP_REWARD} XP
                          </Badge>
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </m.div>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <m.div
                key="success"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{duration: 0.3, ease: "easeInOut"}}
                className="text-center py-4"
              >
                {/* Achievement unlock animation */}
                <div className="relative mb-6">
                  {/* Radial burst */}
                  <m.div
                    initial={{scale: 0, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="size-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-ping" />
                  </m.div>

                  {/* Stars */}
                  {[...Array(6)].map((_, i) => (
                    <m.div
                      key={i}
                      initial={{scale: 0, opacity: 0, x: 0, y: 0}}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: Math.cos((i * Math.PI * 2) / 6) * 60,
                        y: Math.sin((i * Math.PI * 2) / 6) * 60,
                      }}
                      transition={{duration: 1, delay: 0.3 + i * 0.1}}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <Sparkles className="size-4 text-primary fill-primary/50" />
                    </m.div>
                  ))}

                  {/* Badge */}
                  <m.div
                    initial={{scale: 0, rotate: -180}}
                    animate={{scale: 1, rotate: 0}}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                      delay: 0.2,
                    }}
                    className="mx-auto size-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30"
                  >
                    <ShieldCheck className="size-12 text-primary-foreground" />
                  </m.div>
                </div>

                {/* Achievement unlocked text */}
                <m.div
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.5}}
                >
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">
                    Achievement Unlocked
                  </p>
                  <DialogTitle className="text-2xl font-black">
                    Profile Verified!
                  </DialogTitle>
                </m.div>

                {/* XP reward */}
                {xpAwarded !== null && (
                  <m.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.7, type: "spring"}}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/25"
                  >
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-sm font-black text-primary">
                      +{xpAwarded} XP Earned!
                    </span>
                  </m.div>
                )}

                <m.p
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.9}}
                  className="mt-4 text-sm text-muted-foreground max-w-xs mx-auto"
                >
                  You&apos;ve unlocked your verified badge — a mark of
                  authenticity. Showcase your achievements!
                </m.p>

                <m.div
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 1.1}}
                >
                  <Button
                    onClick={handleClose}
                    className="mt-6 w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-5" />
                      Claim Reward
                    </div>
                  </Button>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyCodeforcesDialog;
