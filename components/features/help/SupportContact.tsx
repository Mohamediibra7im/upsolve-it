"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Mail, 
  MessageCircle, 
  Github, 
  Send, 
  CheckCircle,
  Zap,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/Toast";
import { m, m as motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

interface SupportContactProps {
  onBack: () => void;
}

const supportOptions = [
  {
    id: "github",
    title: "GitHub Issues",
    subtitle: "REPORT_A_BUG",
    description: "Report bugs, request features, or contribute to the project repository.",
    icon: Github,
    action: "Open Issue",
    link: "https://github.com/HNU-ICPC-Community",
    color: "sky",
  },
  {
    id: "email",
    title: "Email Support",
    subtitle: "GET_IN_TOUCH",
    description: "Send us a message directly and we will get back to you.",
    icon: Mail,
    action: "Send Email",
    link: "mailto:upsolve.it.1@gmail.com",
    color: "emerald",
  },
];

interface ContactResponse {
  success: boolean;
  message?: string;
}

export default function SupportContact({ onBack }: Readonly<SupportContactProps>) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await apiClient.post<ContactResponse>("/api/contact", formData);

      if (result.success) {
        toast({
          title: "Message Sent",
          description: result.message || "Your message has been sent. We will get back to you soon.",
          variant: "success",
          durationMs: 5000,
        });
        setSubmitted(true);
      } else {
        toast({
          title: "Failed to Send",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          durationMs: 5000,
        });
      }
    } catch (error) {
      console.error("Support contact error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to send message. Check your network and try again.",
        variant: "destructive",
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-20 text-center space-y-6 font-mono text-emerald-400"
      >
        <div className="relative inline-block">
          <div className="relative p-6 bg-emerald-500/5 rounded-sm border border-emerald-500/20 text-emerald-455">
            <CheckCircle className="size-14" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Message Transmitted</h1>
          <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed max-w-sm mx-auto">
            Thanks for reaching out! We will review your transmission and get back to you within 24-48 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => setSubmitted(false)}
            className="w-full sm:w-auto h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] font-mono"
          >
            [ SEND_ANOTHER.EXE ]
          </Button>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full sm:w-auto h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
          >
            [ BACK_TO_HELP.SYS ]
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20 font-mono text-emerald-400 select-none relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="h-9 px-3 rounded-sm border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-mono text-[9px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="size-3.5 mr-1" /> [ BACK ]
          </Button>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-400">
              <MessageCircle className="size-3.5 text-emerald-400 animate-pulse" />
              <span>SUPPORT_HOTLINE</span>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Contact Support
            </h1>
            <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed">
              Have a question or need help? Reach out through any of these channels and we will assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {supportOptions.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card
              className="h-full border border-emerald-500/15 bg-[#060a08]/30 rounded-sm overflow-hidden group hover:border-emerald-500/25 transition-all duration-300 cursor-pointer"
              onClick={() => window.open(option.link, "_blank")}
            >
              <CardContent className="p-6 space-y-4">
                <div className={cn(
                  "size-10 rounded-sm flex items-center justify-center border transition-all duration-300",
                  "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
                )}>
                  <option.icon className="size-5" />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40">{option.subtitle}</span>
                    <div className="h-[1px] w-4 bg-emerald-500/10" />
                  </div>
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">{option.title}</h3>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">{option.description}</p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[9px]">
                  [ {option.action} ] <Zap className="size-3 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border border-emerald-500/15 bg-[#060a08]/20 rounded-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send size={14} className="text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Send Us a Message</h3>
                </div>
                <div className="h-[1px] w-full bg-emerald-500/10" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="support-name" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ YOUR_NAME ]:</label>
                  <Input
                    id="support-name"
                    placeholder="Enter your name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="support-email" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ EMAIL_ADDRESS ]:</label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="support-subject" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ MESSAGE_SUBJECT ]:</label>
                  <Input
                    id="support-subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="support-category" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ ENQUIRY_CATEGORY ]:</label>
                  <div className="relative">
                    <select
                      id="support-category"
                      className="w-full h-10 px-3 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 outline-none appearance-none cursor-pointer uppercase font-bold tracking-wider"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                    >
                      <option value="general" className="bg-[#060a08] text-emerald-300">General Question</option>
                      <option value="bug" className="bg-[#060a08] text-emerald-300">Bug Report</option>
                      <option value="feature" className="bg-[#060a08] text-emerald-300">Feature Request</option>
                      <option value="account" className="bg-[#060a08] text-emerald-300">Account Issues</option>
                      <option value="technical" className="bg-[#060a08] text-emerald-300">Technical Support</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-45">
                      <Zap size={10} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="support-message" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 ml-0.5">[ REPORT_BODY ]:</label>
                <Textarea
                  id="support-message"
                  placeholder="Tell us how we can help..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all p-3 min-h-[120px] font-mono leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all font-mono"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="animate-spin rounded-full size-3 border-b-2 border-emerald-950"></div>
                      <span>TRANSMITTING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <Send className="size-3.5" />
                      <span>TRANSMIT_MESSAGE.EXE</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>

      {/* Response Time Note */}
      <div className="flex items-center justify-center gap-2 text-emerald-500/40 text-[9px] uppercase font-bold tracking-wider">
        <Clock size={12} />
        <span>Response Window: 24-48 Hours Standard Priority</span>
      </div>
    </div>
  );
}
