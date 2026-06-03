import { Bug, Send, AlertTriangle, Terminal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-3xl space-y-16">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
            Protocol: ANOMALY_REPORT
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Report an <span className="text-primary italic">Anomaly</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
            Spotted a glitch in the neural link? File a detailed report so our engineers can patch the system protocols.
          </p>
        </div>

        <div className="p-8 md:p-12 rounded-[3rem] bg-card/30 border border-border/40 backdrop-blur-xl space-y-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Anomaly Type</label>
                <Input className="h-14 rounded-2xl bg-background/50 border-border/40" placeholder="e.g. Navigation Lag, Sync Error" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Severity Level</label>
                <Input className="h-14 rounded-2xl bg-background/50 border-border/40" placeholder="e.g. Critical, Minor" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Observation Logs</label>
              <Textarea 
                className="min-h-[200px] rounded-[2rem] bg-background/50 border-border/40 p-6" 
                placeholder="Describe the anomaly in detail. What protocols were you executing when it occurred?" 
              />
            </div>
          </div>

          <Button className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            <Send size={18} className="mr-3" /> Transmit Report
          </Button>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-wider">
              Note: Every report is analyzed by our core diagnostics team. Estimated response time: 24-48 system cycles.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
              <Bug size={14} />
              <span>Diagnostic Sync: Active</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
              <Terminal size={14} />
              <span>Protocol: v2.4.0</span>
            </div>
          </div>
          <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Link href="/">
              <ArrowLeft size={14} className="mr-2" /> Return to Base
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
