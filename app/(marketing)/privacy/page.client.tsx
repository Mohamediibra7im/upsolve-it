import { Shield, Lock, Eye, Cookie, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "What We Collect",
    icon: Eye,
    content: "We only collect the essential data needed to sync your Codeforces progress, including your handle, rating history, and submission data. We never store your Codeforces password or private credentials."
  },
  {
    title: "How We Protect Your Data",
    icon: Shield,
    content: "Your session data is encrypted and stored securely. We use industry-standard security practices to keep your training history accessible only to you."
  },
  {
    title: "Your Privacy Rights",
    icon: Lock,
    content: "We never sell or share your training data with third parties. Your performance metrics are used solely to provide you with personalized training insights."
  },
  {
    title: "Cookies",
    icon: Cookie,
    content: "We use essential cookies to keep you logged in. No tracking or marketing cookies are used on this platform."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            Privacy Policy
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Your <span className="text-primary">Privacy</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Transparency is important to us. Learn how we handle your data and keep your information safe.
          </p>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="p-8 rounded-3xl bg-card/30 border border-border/40 backdrop-blur-xl space-y-4 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <section.icon size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{section.title}</h3>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8 pt-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
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
