"use client";

import { useState } from "react";
import { Bug, Send, AlertTriangle, Terminal, ArrowLeft, CheckCircle } from "lucide-react";
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
        title: "Report Transmitted",
        description: "Anomaly report successfully logged into secure core diagnostics queue.",
        variant: "success",
        durationMs: 4000,
      });
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden py-20 bg-[#040604] font-mono text-emerald-400 select-none">
        {/* Background terminal grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

        {/* Terminal Scanline overlay */}
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />

        <div className="container mx-auto px-4 max-w-xl text-center space-y-6 relative z-10">
          <div className="relative inline-block">
            <div className="relative p-6 bg-emerald-500/5 rounded-sm border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="size-14" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">ANOMALY LOGGED</h1>
            <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed max-w-sm mx-auto">
              Transmission successfully written to diagnostics registry. Diagnostics core will assess code parameters.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button 
              onClick={() => setSubmitted(false)}
              className="w-full sm:w-auto h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] font-mono"
            >
              [ FILE_NEW_REPORT.SYS ]
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="w-full sm:w-auto h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
            >
              <Link href="/">[ RETURN_TO_BASE.EXE ]</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-20 bg-[#040604] font-mono text-emerald-400 select-none">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />
      
      <div className="container mx-auto px-4 max-w-3xl space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/20 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest rounded-sm">
            [ PROTOCOL: ANOMALY_REPORT ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Report An anomaly
          </h1>
          <p className="text-emerald-500/50 text-xs uppercase max-w-lg mx-auto">
            Spotted a glitch in the neural link? File a detailed report so our engineers can patch the system protocols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-sm bg-[#060a08]/20 border border-emerald-500/15 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ ANOMALY_TYPE ]:</label>
              <Input 
                className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono" 
                placeholder="e.g. Navigation Lag, Sync Error" 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ SEVERITY_LEVEL ]:</label>
              <div className="relative">
                <select
                  className="w-full h-10 px-3 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 outline-none appearance-none cursor-pointer uppercase font-bold tracking-wider"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="minor" className="bg-[#060a08] text-emerald-300">Minor Anomaly</option>
                  <option value="major" className="bg-[#060a08] text-emerald-300">Major Glitch</option>
                  <option value="critical" className="bg-[#060a08] text-emerald-300">Critical Failure</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-45">
                  <Terminal size={10} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ OBSERVATION_LOGS ]:</label>
            <Textarea 
              className="min-h-[140px] rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all p-3 font-mono leading-relaxed" 
              placeholder="Describe the anomaly in detail. What protocols were you executing when it occurred?" 
              value={formData.logs}
              onChange={(e) => setFormData(prev => ({ ...prev, logs: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all font-mono">
            {isSubmitting ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="animate-spin rounded-full size-3 border-b-2 border-emerald-950"></div>
                <span>TRANSMITTING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Send size={14} className="shrink-0" />
                <span>TRANSMIT_REPORT.EXE</span>
              </div>
            )}
          </Button>

          <div className="p-3.5 rounded-sm bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5 animate-pulse" size={14} />
            <p className="text-[9px] font-bold text-amber-400/90 leading-relaxed uppercase tracking-wider">
              Note: Every report is analyzed by our core diagnostics team. Estimated response time: 24-48 system cycles.
            </p>
          </div>
        </form>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500/35 uppercase tracking-wider">
              <Bug size={12} />
              <span>DIAGNOSTIC_SYNC: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500/35 uppercase tracking-wider">
              <Terminal size={12} />
              <span>PROTOCOL: V2.4.0</span>
            </div>
          </div>
          <Button asChild variant="ghost" className="h-9 px-4 rounded-sm border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 text-[9px] font-bold uppercase tracking-widest font-mono">
            <Link href="/">
              <ArrowLeft size={12} className="mr-1.5" /> [ RETURN_TO_BASE.EXE ]
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
