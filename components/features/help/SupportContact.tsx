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
  Clock
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
    title: 'GitHub Issues',
    subtitle: 'Report a Bug',
    description: 'Report bugs, request features, or contribute to the project.',
    icon: Github,
    action: 'Open Issue',
    link: 'https://github.com/HNU-ICPC-Community',
    color: 'sky',
  },
  {
    id: 'email',
    title: 'Email Support',
    subtitle: 'Get in Touch',
    description: 'Send us a message directly and we\'ll get back to you.',
    icon: Mail,
    action: 'Send Email',
    link: 'mailto:upsolve.it.1@gmail.com',
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
          title: 'Message Sent',
          description: result.message || 'Your message has been sent. We\'ll get back to you soon.',
          variant: 'success',
          durationMs: 5000,
        });
        setSubmitted(true);
      } else {
        toast({
          title: 'Failed to Send',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
          durationMs: 5000,
        });
      }
    } catch (error) {
      console.error('Support contact error:', error);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Check your network and try again.',
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
          <h1 className="text-5xl font-black tracking-tighter uppercase">Message <span className="text-primary">Received</span></h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
            Thanks for reaching out! We'll review your message and get back to you within 24-48 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            onClick={() => setSubmitted(false)}
            className="h-14 px-10 rounded-2xl bg-primary font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            Send Another
          </Button>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="h-14 px-10 rounded-2xl border-border/40 font-black uppercase tracking-widest text-xs"
          >
            Back to Help
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
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Help</span>
          </Button>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
              <MessageCircle className="size-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">We're Here to Help</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
              Contact <span className="text-primary">Support</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed opacity-80">
              Have a question or need help? Reach out through any of these channels and we'll assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Contact Form */}
      <m.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-border/40 bg-card/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-10 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Send size={16} className="text-primary" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Send Us a Message</h3>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/40 to-transparent" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="support-name" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Your Name</label>
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
                  <label htmlFor="support-category" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Category</label>
                  <div className="relative">
                    <select
                      id="support-category"
                      className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-border/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-black text-[10px] uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="general">General Question</option>
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
                <label htmlFor="support-message" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Message</label>
                <Textarea
                  id="support-message"
                  placeholder="Tell us how we can help..."
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
        </Card>
      </m.div>

      {/* Response Time Note */}
      <div className="flex items-center justify-center gap-3 text-muted-foreground/60">
        <Clock size={14} />
        <span className="text-xs font-medium">We typically respond within 24-48 hours</span>
      </div>
    </div>
  );
}
