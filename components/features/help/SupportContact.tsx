'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  MessageCircle, 
  Github, 
  Send, 
  CheckCircle,
  ShieldCheck,
  Zap,
  Radio,
  Sparkles,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers/Toast';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

interface SupportContactProps {
  onBack: () => void;
}

const supportOptions = [
  {
    id: 'github',
    title: 'Intelligence Logs',
    subtitle: 'GitHub Issues',
    description: 'Report system anomalies, request new protocols, or contribute to the core logic.',
    icon: Github,
    action: 'Open Issue',
    link: 'https://github.com/HNU-ICPC-Community',
    color: 'sky',
  },
  {
    id: 'email',
    title: 'Direct Signal',
    subtitle: 'Email Support',
    description: 'Send an encrypted message directly to our community engineers for personalized assistance.',
    icon: Mail,
    action: 'Initiate Link',
    link: 'mailto:fcsithnucommunty@gmail.com',
    color: 'emerald',
  },

];

interface ContactResponse {
  success: boolean;
  message?: string;
}

export default function SupportContact({ onBack }: Readonly<SupportContactProps>) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await apiClient.post<ContactResponse>('/api/contact', formData);

      if (result.success) {
        toast({
          title: 'Signal Transmitted',
          description: result.message || 'Your message has been securely sent. Diagnostics will begin shortly.',
          variant: 'success',
          durationMs: 5000,
        });
        setSubmitted(true);
      } else {
        toast({
          title: 'Transmission Failed',
          description: 'Signal interference detected. Please try again.',
          variant: 'destructive',
          durationMs: 5000,
        });
      }
    } catch (error) {
      console.error('Support Signal Transmission Error:', error);
      toast({
        title: 'Neural Link Error',
        description: error instanceof Error ? error.message : 'Failed to establish connection. Check your network status.',
        variant: 'destructive',
        durationMs: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="relative p-8 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
            <CheckCircle className="size-20" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase">Signal <span className="text-primary">Received</span></h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
            Your intelligence has been logged. Our engineers will analyze the transmission and respond within 24-48 cycles.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            onClick={() => setSubmitted(false)}
            className="h-14 px-10 rounded-2xl bg-primary font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            New Transmission
          </Button>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="h-14 px-10 rounded-2xl border-border/40 font-black uppercase tracking-widest text-xs"
          >
            Return to Center
          </Button>
        </div>
      </m.div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6 max-w-2xl">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="h-10 px-4 rounded-xl bg-white/5 hover:bg-primary/10 hover:text-primary transition-all group"
          >
            <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Interface</span>
          </Button>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
              <Radio className="size-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Secure Link Established</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
              Signal <span className="text-primary">Support</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed opacity-80">
              Need direct assistance? Our community engineers are standing by to resolve system anomalies and provide tactical guidance.
            </p>
          </div>
        </div>

        <div className="hidden lg:block opacity-[0.03] rotate-12">
          <MessageCircle size={280} />
        </div>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {supportOptions.map((option, idx) => (
          <m.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className="h-full border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-primary/40 hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => window.open(option.link, '_blank')}
            >
              <CardContent className="p-10 space-y-8">
                <div className={cn(
                  "size-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6",
                  option.color === "sky" && "bg-sky-500/10 border-sky-500/20 text-sky-500",
                  option.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  option.color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  <option.icon className="size-7" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{option.subtitle}</span>
                    <div className="h-[1px] w-4 bg-border/40" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{option.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">{option.description}</p>
                </div>

                <div className="pt-4 flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  {option.action} <Zap className="size-3 fill-primary" />
                </div>
              </CardContent>
            </Card>
          </m.div>
        ))}
      </div>

      {/* Main Console Section */}
      <m.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="border-border/40 bg-card/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
          {/* Console Header Bar */}
          <div className="h-12 border-b border-border/20 bg-white/5 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-red-500/40" />
                <div className="size-2 rounded-full bg-amber-500/40" />
                <div className="size-2 rounded-full bg-emerald-500/40" />
              </div>
              <div className="h-4 w-[1px] bg-border/20 mx-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <Terminal size={12} className="text-primary" />
                COM_LINK_SECURE.v2
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Link Strength: 98%</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            {/* Sidebar Diagnostics */}
            <div className="lg:col-span-4 border-r border-border/20 bg-background/20 p-10 space-y-12">
              <div className="space-y-6">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight uppercase">Security Layer</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-60">
                    All transmissions are routed through a secure community proxy. No private intelligence is stored locally.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Signal Priorities</h4>
                <div className="space-y-3">
                  {[
                    { label: "Technical", status: "12-24h", color: "bg-primary" },
                    { label: "Community", status: "24-48h", color: "bg-emerald-500" },
                    { label: "Security", status: "PRIORITY", color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border/10 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-1.5 rounded-full", item.color)} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground/40">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border/10">
                 <div className="flex items-center gap-3 text-muted-foreground/40">
                   <Radio size={14} />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">Listening on Community Port 8080</span>
                 </div>
              </div>
            </div>

            {/* Form Interface */}
            <div className="lg:col-span-8 p-10 md:p-14">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Inquiry</h3>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-primary/40 to-transparent" />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label htmlFor="support-name" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Full Name</label>
                    <Input
                      id="support-name"
                      placeholder="Enter your name..."
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-bold text-sm tracking-tight placeholder:text-muted-foreground/20"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="support-email" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Email Address</label>
                    <Input
                      id="support-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-bold text-sm tracking-tight placeholder:text-muted-foreground/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label htmlFor="support-subject" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Subject</label>
                    <Input
                      id="support-subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-bold text-sm tracking-tight placeholder:text-muted-foreground/20"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="support-category" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Inquiry Type</label>
                    <div className="relative">
                      <select
                        id="support-category"
                        className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-black text-[10px] uppercase tracking-widest outline-none appearance-none cursor-pointer"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="account">Account Issues</option>
                        <option value="technical">Technical Support</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <Zap size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="support-message" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Message Details</label>
                  <Textarea
                    id="support-message"
                    placeholder="Describe your issue or request in detail..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="rounded-[2.5rem] bg-white/5 border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium p-8 min-h-[180px] text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-16 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_50px_rgba(var(--primary),0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full size-3 border-b-2 border-white"></div>
                        SENDING...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Send className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      </m.div>
    </div>
  );
}
