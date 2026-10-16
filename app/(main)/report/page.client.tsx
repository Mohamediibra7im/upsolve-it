"use client";

import { useState } from "react";
import { Bug, Send, AlertTriangle, ChevronDown, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/Toast";

export default function ReportPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    severity: "minor",
    logs: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Report preview ready",
        description: "This form is a preview. Your report has not been sent.",
        variant: "success",
        durationMs: 4000,
      });
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8 sm:py-12 font-sans text-foreground">

        <div className="mx-auto w-full max-w-xl text-center space-y-6 relative z-10">
          <div className="relative inline-block">
            <div className="relative p-6 bg-primary/10 rounded-lg border border-border text-primary">
              <CheckCircle className="size-14" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-white font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-foreground">Report preview complete</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Your report is ready to review. This form is a preview and does not send reports yet.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              onClick={() => setSubmitted(false)}
              className="w-full sm:w-auto h-10 px-6 rounded-lg bg-primary hover:bg-primary text-primary-foreground font-medium text-xs font-sans"
            >
              Create another report
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-10 px-6 rounded-lg border border-border bg-transparent text-primary font-medium text-xs hover:bg-primary/10 transition-all font-sans"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8 sm:py-12 font-sans text-foreground">
      {/* Background grid */}

      <div className="mx-auto w-full max-w-3xl space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-border text-primary text-xs font-medium rounded-lg">
            Help improve Upsolve.it
          </div>
          <h1 className="text-white leading-none font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-foreground">
            Help us make it better.
          </h1>
          <p className="text-muted-foreground text-xs max-w-lg mx-auto">
            Something not working as expected? Describe what happened and the steps that led to it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-2xl bg-card border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="report-title" className="text-sm font-medium text-foreground">Issue title</label>
              <Input id="report-title"
                className="h-10 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:border-border outline-none transition-all font-sans"
                placeholder="e.g. My Codeforces profile isn’t syncing"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="report-severity" className="text-sm font-medium text-foreground">Severity</label>
              <div className="relative">
                <select id="report-severity"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-xs text-foreground outline-none appearance-none cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="minor" className="bg-card text-foreground">Minor issue</option>
                  <option value="major" className="bg-card text-foreground">Major issue</option>
                  <option value="critical" className="bg-card text-foreground">Critical issue</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-45">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="report-description" className="text-sm font-medium text-foreground">What happened?</label>
            <Textarea id="report-description"
              className="min-h-[140px] rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:border-border outline-none transition-all p-3 font-sans leading-relaxed"
              placeholder="Describe what happened, what you expected, and how to reproduce the issue."
              value={formData.logs}
              onChange={(e) => setFormData(prev => ({ ...prev, logs: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-lg bg-primary hover:bg-primary text-primary-foreground font-medium text-xs transition-all font-sans">
            {isSubmitting ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="animate-spin rounded-full size-3 border-b-2 border-border"></div>
                <span>Preparing report…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Send size={14} className="shrink-0" />
                <span>Preview report</span>
              </div>
            )}
          </Button>

          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={14} />
            <p className="text-xs font-medium text-amber-300 leading-relaxed">
              This form is a preview. To report an issue, visit our <Link href="/help/support" className="underline underline-offset-4">support center</Link>.
            </p>
          </div>
        </form>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Bug size={12} />
              <span>Report preview</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Bug size={12} />
              <span>Feedback</span>
            </div>
          </div>
          <Button asChild variant="ghost" className="h-9 px-4 rounded-lg border border-border text-primary hover:text-foreground hover:bg-primary/10 text-xs font-medium font-sans">
            <Link href="/">
              <ArrowLeft size={12} className="mr-1.5" /> Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
