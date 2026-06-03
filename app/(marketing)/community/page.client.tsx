import { Users, Heart, MessageSquare, ShieldCheck, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const rules = [
  {
    title: "Respect the Grind",
    icon: Heart,
    content: "Support your fellow programmers. Every master was once a beginner. Toxicity has no place in the Command Center."
  },
  {
    title: "Intelligence Integrity",
    icon: ShieldCheck,
    content: "Do not cheat. Upsolving is about personal growth. Sharing solutions during active contests or using prohibited tools is a violation of our core protocol."
  },
  {
    title: "Collaborative Growth",
    icon: MessageSquare,
    content: "Engage in constructive discussions. Help others debug, share your logic, and grow together as a global community of problem solvers."
  },
  {
    title: "Focus on Mastery",
    icon: Trophy,
    content: "The goal is improvement, not just rating. Celebrate the process of learning and the thrill of solving complex algorithmic challenges."
  }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            Protocol: COMMUNITY_ETHICS
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Code of <span className="text-primary italic">Conduct</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Our community is built on mutual respect and the shared passion for algorithmic excellence. These are the protocols that define our culture.
          </p>
        </div>

        <div className="grid gap-6">
          {rules.map((rule, idx) => (
            <div
              key={rule.title}
              className="group p-8 rounded-[2.5rem] bg-card/30 border border-border/40 backdrop-blur-xl transition-all hover:border-primary/30 animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="p-6 rounded-3xl bg-background/50 text-primary border border-border/40 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                  <rule.icon size={32} />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Rule 0{idx + 1}</span>
                    <div className="h-[1px] w-8 bg-primary/20" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{rule.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed italic opacity-80">
                    "{rule.content}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8 pt-8 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Standing Together as One Community</span>
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
