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
import { Badge } from "@/components/ui/badge";
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
      className={`h-full rounded-sm transition-all duration-1000 linear ${isLow ? "bg-red-500" : "bg-emerald-400"}`}
    />
  );
}

const steps = [
  { icon: ScrollText, label: "SETTINGS" },
  { icon: KeyRound, label: "CODE" },
  { icon: ShieldCheck, label: "VERIFY" },
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
      <div className={`flex items-center gap-1.5 text-[9px] font-bold ${isLow ? "text-red-400" : "text-emerald-400"}`}>
        <Clock className="size-3" />
        <span>{formatTime(timeLeft)}</span>
      </div>
      <div className="w-16 h-1 rounded-sm bg-emerald-950/40 border border-emerald-500/10 overflow-hidden">
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

  const { generateVerificationCode, verifyCodeforcesProfile } = useUser();

  useEffect(() => {
    if (expiresAt && (step === "step2" || step === "step3")) {
      if (!timerStartedAt) {
        setTimerStartedAt(Date.now());
      }

      const tick = () => {
        const remaining = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000)
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
          : -1
      );
      setStep(next);
    },
    [step]
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
      <DialogContent className="sm:max-w-md border border-emerald-500/25 bg-[#060a08] p-0 font-mono text-emerald-400 overflow-hidden shadow-[0_6px_22px_rgba(0,0,0,0.7)]">
        <VisuallyHidden>
          <DialogTitle>Verify your Codeforces profile</DialogTitle>
          <DialogDescription>
            Complete the verification quest to unlock all features and prove your Codeforces identity.
          </DialogDescription>
        </VisuallyHidden>

        {/* Quest header bar */}
        {step !== "intro" && step !== "success" && (
          <div className="relative border-b border-emerald-500/15">
            <div className="h-0.5 bg-emerald-950">
              <motion.div
                className="h-full bg-emerald-500"
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
            <div className="flex items-center justify-between px-6 py-2.5 bg-emerald-950/15">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                  Verification Quest
                </span>
              </div>
              {step === "step2" || step === "step3" ? (
                <CountdownTimer expiresAt={expiresAt} timerStartedAt={timerStartedAt} timeLeft={timeLeft} />
              ) : (
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-emerald-400">
                  [ REWARD: +{XP_REWARD} XP ]
                </span>
              )}
            </div>
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 py-2 px-6 bg-[#040604]/30 border-t border-emerald-500/5">
              {steps.map((s, i) => {
                const isActive = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                return (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[8.5px] font-bold uppercase tracking-wide",
                      isDone
                        ? "text-emerald-500/40"
                        : isActive
                        ? "text-emerald-300"
                        : "text-emerald-500/15"
                    )}>
                      {isDone ? `[✓ ${s.label}]` : isActive ? `[█ ${s.label}]` : `[░ ${s.label}]`}
                    </span>
                    {i < steps.length - 1 && (
                      <span className="text-emerald-500/10 font-bold">&gt;</span>
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
                {/* Quest banner */}
                <div className="relative border border-emerald-500/15 bg-emerald-950/5 p-5 text-center rounded-sm">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  <div className="relative space-y-3">
                    <div className="mx-auto size-11 rounded-sm bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                        Verification Quest
                      </h2>
                      <p className="text-[9px] text-emerald-500/60 uppercase tracking-wide mt-1">
                        Prove your Codeforces identity and unlock features
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quest objectives */}
                <div className="space-y-1.5 text-[9px] uppercase tracking-wide">
                  <p className="font-bold text-emerald-500/40">
                    {"// Quest Objectives"}
                  </p>
                  <div className="flex items-center gap-3 p-2.5 rounded-sm bg-[#040604] border border-emerald-500/10">
                    <ScrollText className="size-3.5 text-emerald-500/40 shrink-0" />
                    <span className="text-emerald-500/65">
                      Open your Codeforces profile settings
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-sm bg-[#040604] border border-emerald-500/10">
                    <KeyRound className="size-3.5 text-emerald-500/40 shrink-0" />
                    <span className="text-emerald-500/65">
                      Paste a verification code in your first name
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-sm bg-[#040604] border border-emerald-500/10">
                    <ShieldCheck className="size-3.5 text-emerald-500/40 shrink-0" />
                    <span className="text-emerald-500/65">
                      Verify and unlock your profile badge
                    </span>
                  </div>
                </div>

                {/* Rewards preview */}
                <div className="flex items-center justify-between p-3 rounded-sm border border-emerald-500/20 bg-emerald-950/10 text-[9px] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-300">Quest Reward:</span>
                  </div>
                  <span className="font-bold text-emerald-300">
                    +{XP_REWARD} XP &amp; VERIFIED_BADGE
                  </span>
                </div>

                {error && (
                  <div className="p-2.5 rounded-sm bg-red-950/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleStart}
                  disabled={isGenerating}
                  className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                      <span>INITIALIZING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center">
                      <Zap className="size-3.5" />
                      <span>START_VERIFICATION_QUEST.SH</span>
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
                <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <button
                    onClick={() => navigateStep("intro")}
                    className="flex items-center gap-1 text-emerald-500/60 hover:text-emerald-300 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    [ PREVIOUS ]
                  </button>
                  <span className="text-emerald-500/40">
                    OBJECTIVE 1/3
                  </span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Open Codeforces settings
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 uppercase max-w-xs mx-auto leading-relaxed">
                    Navigate to the following settings page while logged in to Codeforces:
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                  >
                    [ OPEN_CODEFORCES_SETTINGS.EXE ]
                    <ExternalLink className="size-3.5" />
                  </a>

                  <div className="text-center font-mono text-[9px]">
                    <a
                      href="https://codeforces.com/settings/social"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500/45 hover:text-emerald-300 transition-colors underline decoration-emerald-500/20"
                    >
                      cf/settings/social
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-[#040604] border border-emerald-500/10 text-[9px] text-emerald-500/50 uppercase leading-relaxed text-center">
                  {"// Note: This settings page governs your public social parameters profile."}
                </div>

                <Button
                  onClick={() => navigateStep("step2")}
                  className="w-full h-10 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <span>CONTINUE_QUEST.SYS</span>
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
                <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <button
                    onClick={() => navigateStep("step1")}
                    className="flex items-center gap-1 text-emerald-500/60 hover:text-emerald-300 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    [ PREVIOUS ]
                  </button>
                  <span className="text-emerald-500/40">
                    OBJECTIVE 2/3
                  </span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Paste verification code
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 uppercase max-w-xs mx-auto leading-relaxed">
                    Edit the First Name input box on Codeforces and paste this exact token:
                  </p>
                </div>

                {isExpired ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-sm bg-red-950/5 border border-red-500/20 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <Clock className="size-4 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                          Verification Code Expired
                        </p>
                      </div>
                      <p className="text-[9px] text-emerald-500/45 uppercase leading-relaxed">
                        Verification codes expire after 2 minutes for security parameters.
                      </p>
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-sm bg-red-950/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>GENERATING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <RotateCcw className="size-3.5" />
                          <span>REGENERATE_TOKEN.EXE</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Code display */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-[#040604] border border-emerald-500/20 rounded-sm p-1">
                        <div className="flex-1 h-10 px-3 flex items-center font-mono text-base font-black tracking-widest text-emerald-300">
                          {verificationCode}
                        </div>
                        <Button
                          variant="secondary"
                          onClick={handleCopy}
                          className="h-8 px-3 gap-1 rounded-sm font-bold text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 transition-colors"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-emerald-400" />
                              COPIED
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              COPY
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="text-[8.5px] text-emerald-500/50 uppercase leading-relaxed text-center">
                      This unique token proves profile ownership. You can temporarily revert your settings after verification.
                    </p>

                    <Button
                      onClick={() => navigateStep("step3")}
                      disabled={isExpired}
                      className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                    >
                      <div className="flex items-center gap-1.5 justify-center">
                        <span>I_HAVE_PASTED_CODE.EXE</span>
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
                <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <button
                    onClick={() => navigateStep("step2")}
                    className="flex items-center gap-1 text-emerald-500/60 hover:text-emerald-300 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    [ PREVIOUS ]
                  </button>
                  <span className="text-emerald-500/40">
                    FINAL OBJECTIVE
                  </span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Save settings &amp; verify
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 uppercase max-w-xs mx-auto leading-relaxed">
                    Make sure you hit the &quot;Save Changes&quot; button at the bottom of the Codeforces settings page.
                  </p>
                </div>

                <p className="text-[9px] text-emerald-500/40 uppercase tracking-wide text-center">
                  {"// Launch identity validation check once ready."}
                </p>

                {isExpired ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-sm bg-red-950/5 border border-red-500/20 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <Clock className="size-4 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                          Verification Code Expired
                        </p>
                      </div>
                      <p className="text-[9px] text-emerald-500/45 uppercase leading-relaxed">
                        Verification codes expire after 2 minutes for security parameters.
                      </p>
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-sm bg-red-950/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>GENERATING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <RotateCcw className="size-3.5" />
                          <span>REGENERATE_TOKEN.EXE</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="p-2.5 rounded-sm bg-red-950/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="w-full h-11 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="size-3.5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                          <span>VERIFYING_CREDENTIALS...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          <ShieldCheck className="size-4" />
                          <span>EXECUTE_FINAL_VALIDATION.SYS</span>
                          <span className="text-[8.5px] text-emerald-950/65 font-bold">
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
                    className="mx-auto size-16 rounded-sm bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  >
                    <ShieldCheck className="size-8 text-emerald-400" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-emerald-500/40">
                    {"// Quest Completed"}
                  </p>
                  <DialogTitle className="text-lg font-bold text-white uppercase tracking-wider">
                    Profile Verified!
                  </DialogTitle>
                </div>

                {xpAwarded !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/15 border border-emerald-500/25 rounded-sm text-[9px] font-bold text-emerald-300">
                    <Sparkles className="size-3.5 text-emerald-400 animate-pulse" />
                    <span>REWARD_CLAIMED: +{xpAwarded} XP EARNED</span>
                  </div>
                )}

                <p className="text-[10px] text-emerald-500/60 max-w-xs mx-auto uppercase leading-relaxed">
                  You have successfully unlocked your verified profile badge — a mark of CP authenticity.
                </p>

                <Button
                  onClick={handleClose}
                  className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <UserCheck className="size-4" />
                    <span>CLAIM_REWARDS_AND_CLOSE.SYS</span>
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
