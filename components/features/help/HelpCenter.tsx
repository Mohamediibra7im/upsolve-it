"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { m as motion, AnimatePresence } from "framer-motion";
import StudioMascot from "@/components/shared/StudioMascot";
import HelpSearch from "./HelpSearch";

const helpCategories = [
  {
    title: "Your first session",
    description:
      "From creating an account to finding your first set of problems.",
    icon: Compass,
    href: "/help/quick-start",
    detail: "Start here",
  },
  {
    title: "Questions, answered",
    description: "Understand training, profile syncing, upsolving, and more.",
    icon: BookOpen,
    href: "/help/faq",
    detail: "Browse the FAQ",
  },
  {
    title: "A little extra help",
    description:
      "Tell us where you’re stuck. We’ll help you find your next step.",
    icon: MessageCircle,
    href: "/help/support",
    detail: "Contact support",
  },
];

const quickLinks = [
  "How do I create an account?",
  "How do I sync my profile?",
  "How do practice sessions work?",
  "What is upsolving?",
  "How do I change my password?",
  "Is my data safe?",
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative mx-auto max-w-6xl space-y-12 pb-16 font-sans text-[#f1f3ee] sm:space-y-16">
      <header className="grid items-center gap-8 border-b border-[#2b3031] pb-10 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="mb-4 text-sm font-medium text-[#b5e3c4]">Help center</p>
          <h1 className="max-w-2xl font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            A little guidance.
            <br />A clearer next step.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#929b98]">
            Find an answer, learn your way around, and get back to solving.
          </p>
          <div className="relative mt-7 max-w-xl">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#929b98]"
            />
            <Input
              aria-label="Search help"
              placeholder="Search questions or topics…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-14 rounded-2xl border-[#39403c] bg-[#191c1e] pl-11 text-base placeholder:text-[#929b98]"
            />
          </div>
        </div>
        <div className="hidden self-end sm:block">
          <StudioMascot pose="learn" className="mx-auto w-full max-w-64" />
          <p className="mt-3 text-center text-sm text-[#929b98]">
            There’s always a way forward.
          </p>
        </div>
      </header>

      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <HelpSearch query={searchQuery} />
          </motion.div>
        )}
      </AnimatePresence>

      <section
        aria-labelledby="help-paths"
        className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12"
      >
        <div>
          <h2
            id="help-paths"
            className="font-heading text-2xl font-medium tracking-tight"
          >
            Find your way.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#929b98]">
            New here or already in a routine, start with what you need.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#2b3031] bg-[#191c1e]">
          {helpCategories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className="group flex items-start gap-4 border-b border-[#2b3031] p-5 transition-colors last:border-b-0 hover:bg-[#b5e3c4]/5 sm:items-center sm:gap-5 sm:p-6"
            >
              <span className="hidden text-xs tabular-nums text-[#929b98] sm:block">
                0{index + 1}
              </span>
              <category.icon
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-[#b5e3c4] sm:mt-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-lg font-medium text-[#f1f3ee]">
                  {category.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#929b98]">
                  {category.description}
                </p>
                <p className="mt-3 text-xs font-medium text-[#b5e3c4]">
                  {category.detail}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-[#929b98] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="common-questions"
        className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12"
      >
        <div>
          <h2
            id="common-questions"
            className="font-heading text-2xl font-medium tracking-tight"
          >
            Good questions.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#929b98]">
            A few things people often ask us.
          </p>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {quickLinks.map((label) => (
            <Link
              key={label}
              href="/help/faq"
              className="group flex items-center justify-between gap-4 border-b border-[#2b3031] py-5 text-sm text-[#b8c0bb] transition-colors hover:text-[#b5e3c4]"
            >
              <span>{label}</span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-[#929b98] transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </section>

      <Link
        href="/docs"
        className="group flex flex-col justify-between gap-5 rounded-2xl border border-[#2b3031] bg-[#191c1e] p-6 transition-colors hover:border-[#69746e] sm:flex-row sm:items-center sm:p-8"
      >
        <div>
          <p className="text-sm font-medium text-[#b5e3c4]">
            The complete guide
          </p>
          <h2 className="mt-2 font-heading text-2xl font-medium tracking-tight">
            Get to know your training space.
          </h2>
          <p className="mt-2 text-sm text-[#929b98]">
            Explore every feature, at your own pace.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-sm text-[#b5e3c4]">
          Read the guide <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
