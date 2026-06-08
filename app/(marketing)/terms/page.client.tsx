import { Zap, Target, ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Using the Platform",
    icon: Globe,
    content: "Access to Upsolve.it is for personal use to improve your competitive programming skills. Automated scraping or interfering with the platform is not allowed."
  },
  {
    title: "Expected Behavior",
    icon: Target,
    content: "Respect the community. Don't try to bypass security, reverse-engineer the system, or disrupt the experience for others."
  },
  {
    title: "Data Accuracy",
    icon: Zap,
    content: "While we aim for accurate syncing, we're not responsible for delays or discrepancies from external sources like the Codeforces API. Training data is for informational purposes."
  },
  {
    title: "Account Termination",
    icon: ShieldAlert,
    content: "We reserve the right to suspend accounts that violate these terms. Keeping the platform safe and stable is our top priority."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
            Terms of Service
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-foreground">
            Terms <span className="text-primary">of Service</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            By using Upsolve.it, you agree to the following terms. Please read them carefully.
          </p>
        </div>

        <div className="grid gap-6">
          {terms.map((term) => (
            <div
              key={term.title}
              className="group p-8 rounded-3xl bg-card/30 border border-border/40 backdrop-blur-xl transition-all hover:bg-card/50 hover:border-primary/20"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-background/50 text-primary border border-border/40 group-hover:border-primary/40 transition-colors">
                  <term.icon size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tight">{term.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {term.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8 pt-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
            Last Updated: June 2026
          </p>
          <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Link href="/">
              <ArrowLeft size={14} className="mr-2" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
