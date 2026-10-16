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
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/Toast";
import { m as motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

interface SupportContactProps {
  onBack: () => void;
}

const supportOptions = [
  {
    id: "github",
    title: "GitHub Issues",
    subtitle: "Bugs & suggestions",
    description:
      "Report bugs, request features, or contribute to the project repository.",
    icon: Github,
    action: "Open Issue",
    link: "https://github.com/HNU-ICPC-Community",
    color: "sky",
  },
  {
    id: "email",
    title: "Email Support",
    subtitle: "Get in touch",
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

export default function SupportContact({
  onBack,
}: Readonly<SupportContactProps>) {
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
      const result = await apiClient.post<ContactResponse>(
        "/api/contact",
        formData,
      );

      if (result.success) {
        toast({
          title: "Message Sent",
          description:
            result.message ||
            "Your message has been sent. We will get back to you soon.",
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
        description:
          error instanceof Error
            ? error.message
            : "Failed to send message. Check your network and try again.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-20 text-center space-y-6 font-sans text-[#f1f3ee]"
      >
        <div className="relative inline-block">
          <div className="relative p-6 bg-[#b5e3c4]/5 rounded-xl border border-[#2b3031] text-[#b5e3c4]">
            <CheckCircle className="size-14" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
            Message sent
          </h1>
          <p className="text-sm text-[#929b98] leading-relaxed max-w-sm mx-auto">
            Thanks for reaching out. We’ll review your message and get back to
            you within 24–48 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => setSubmitted(false)}
            className="w-full sm:w-auto h-10 px-6 rounded-xl bg-[#b5e3c4] hover:bg-[#ceedd8] text-[#101214] font-medium tracking-normal text-sm  font-sans"
          >
            Send another message
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto h-10 px-6 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-sm hover:bg-[#b5e3c4]/10 transition-all font-sans"
          >
            Back to help
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20 font-sans text-[#f1f3ee]  relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-9 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:text-[#b5e3c4] hover:bg-[#b5e3c4]/5 font-sans text-xs font-medium tracking-normal"
          >
            <ArrowLeft className="size-3.5 mr-1" /> Back
          </Button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b5e3c4]/20 border border-[#2b3031] rounded-xl text-xs font-medium tracking-normal text-[#b5e3c4]">
              <MessageCircle className="size-3.5 text-[#b5e3c4]" />
              <span>Support</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
              Let’s work it out.
            </h1>
            <p className="text-sm text-[#929b98] leading-relaxed">
              Have a question or need help? Reach out through any of these
              channels and we will assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Contact channels and message form */}
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <aside
          aria-label="Other ways to reach us"
          className="grid gap-4 sm:grid-cols-2 lg:sticky lg:top-28 lg:grid-cols-1"
        >
          {supportOptions.map((option, idx) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <a
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
              >
                <Card className="h-full border border-[#2b3031] bg-[#191c1e] rounded-2xl overflow-hidden group hover:border-[#69746e] transition-all duration-300 cursor-pointer">
                  <CardContent className="p-5 space-y-4">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                        "bg-[#b5e3c4]/5 border-[#2b3031] text-[#b5e3c4]",
                      )}
                    >
                      <option.icon className="size-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium tracking-normal text-[#929b98]">
                          {option.subtitle}
                        </span>
                        <div className="h-[1px] w-4 bg-[#b5e3c4]/10" />
                      </div>
                      <h3 className="text-lg font-medium text-[#b5e3c4] tracking-normal group-hover:text-[#b5e3c4] transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-[#929b98] leading-relaxed ">
                        {option.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 text-[#b5e3c4] font-medium tracking-normal text-xs">
                      {option.action} <Zap className="size-3 text-[#b5e3c4]" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </aside>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="min-w-0"
        >
          <Card className="border border-[#2b3031] bg-[#191c1e] rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Send size={14} className="text-[#b5e3c4]" />
                    <h3 className="text-lg font-medium tracking-normal text-[#f1f3ee]">
                      Send us a message
                    </h3>
                  </div>
                  <div className="h-[1px] w-full bg-[#b5e3c4]/10" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="support-name"
                      className="text-xs font-medium tracking-normal text-[#929b98] ml-0.5"
                    >
                      Your name
                    </label>
                    <Input
                      id="support-name"
                      placeholder="Enter your name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="h-12 rounded-xl bg-[#101214] border border-[#2b3031] text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus-visible:ring-[#b5e3c4] focus:border-[#b5e3c4] outline-none transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="support-email"
                      className="text-xs font-medium tracking-normal text-[#929b98] ml-0.5"
                    >
                      Email address
                    </label>
                    <Input
                      id="support-email"
                      type="email"
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="h-12 rounded-xl bg-[#101214] border border-[#2b3031] text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus-visible:ring-[#b5e3c4] focus:border-[#b5e3c4] outline-none transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="support-subject"
                      className="text-xs font-medium tracking-normal text-[#929b98] ml-0.5"
                    >
                      Subject
                    </label>
                    <Input
                      id="support-subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="h-12 rounded-xl bg-[#101214] border border-[#2b3031] text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus-visible:ring-[#b5e3c4] focus:border-[#b5e3c4] outline-none transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="support-category"
                      className="text-xs font-medium tracking-normal text-[#929b98] ml-0.5"
                    >
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="support-category"
                        className="w-full h-12 px-3 pr-8 rounded-xl bg-[#101214] border border-[#2b3031] text-sm text-[#b5e3c4] outline-none focus:ring-2 focus:ring-[#b5e3c4] appearance-none cursor-pointer font-medium tracking-normal"
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                      >
                        <option
                          value="general"
                          className="bg-[#191c1e] text-[#b5e3c4]"
                        >
                          General Question
                        </option>
                        <option
                          value="bug"
                          className="bg-[#191c1e] text-[#b5e3c4]"
                        >
                          Bug Report
                        </option>
                        <option
                          value="feature"
                          className="bg-[#191c1e] text-[#b5e3c4]"
                        >
                          Feature Request
                        </option>
                        <option
                          value="account"
                          className="bg-[#191c1e] text-[#b5e3c4]"
                        >
                          Account Issues
                        </option>
                        <option
                          value="technical"
                          className="bg-[#191c1e] text-[#b5e3c4]"
                        >
                          Technical Support
                        </option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-45">
                        <Zap size={10} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="support-message"
                    className="text-xs font-medium tracking-normal text-[#929b98] ml-0.5"
                  >
                    Message
                  </label>
                  <Textarea
                    id="support-message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    className="rounded-xl bg-[#101214] border border-[#2b3031] text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus-visible:ring-[#b5e3c4] focus:border-[#b5e3c4] outline-none transition-all p-3 min-h-[120px] font-sans leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#b5e3c4] hover:bg-[#ceedd8] text-[#101214] font-medium tracking-normal text-sm  transition-all font-sans"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="animate-spin rounded-full size-3 border-b-2 border-[#2b3031]"></div>
                        <span>Sending…</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        <Send className="size-3.5" />
                        <span>Send message</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Response Time Note */}
      <div className="flex items-center justify-center gap-2 text-[#929b98] text-xs font-medium tracking-normal">
        <Clock size={12} />
        <span>We usually reply within 24–48 hours.</span>
      </div>
    </div>
  );
}
