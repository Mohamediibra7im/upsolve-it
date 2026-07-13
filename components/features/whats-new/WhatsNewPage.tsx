"use client";

import { useWhatsNewPublished, type WhatsNewEntry } from "@/hooks/admin";
import Loader from "@/components/shared/Loader";
import { m as motion } from "framer-motion";
import { Sparkles, Calendar, Tag, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/ui/markdown-renderer";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, ".");
}

function EntryCard({ entry, index }: { entry: WhatsNewEntry; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="group relative"
    >
      {/* Timeline dot + connector */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-emerald-500/10 hidden md:block" />
      <div className="absolute -left-[4.5px] top-6 font-bold text-emerald-500/40 text-[9px] bg-[#040604] px-0.5 hidden md:block">
        [█]
      </div>

      <div
        className={cn(
          "relative md:ml-6 rounded-sm border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden",
          "transition-all duration-300",
          "hover:border-emerald-500/25",
        )}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 sm:px-6 sm:pt-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {entry.version && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-[8.5px] font-bold uppercase tracking-wider">
                <Tag size={10} />
                v{entry.version}
              </span>
            )}
            {entry.publishedAt && (
              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-500/40 uppercase tracking-widest">
                <Calendar size={10} />
                {formatDate(entry.publishedAt)}
              </span>
            )}
          </div>

          <h2 className="text-sm font-bold tracking-wide text-emerald-300 uppercase leading-snug">
            {entry.title}
          </h2>
        </div>

        {/* Markdown Body */}
        <div className="px-6 pb-5 sm:px-6 sm:pb-5">
          <MarkdownRenderer
            className="prose prose-xs dark:prose-invert max-w-none text-[10px] text-emerald-500/70 leading-relaxed uppercase prose-headings:text-emerald-300 prose-headings:font-bold prose-headings:text-xs prose-a:text-emerald-400 prose-a:underline hover:prose-a:text-emerald-300 prose-code:text-emerald-300 prose-code:bg-emerald-500/5 prose-code:border prose-code:border-emerald-500/10 prose-code:px-1 prose-code:py-0.2 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-emerald-500/10 prose-pre:rounded-sm prose-img:rounded-sm prose-blockquote:border-emerald-500/20"
          >
            {entry.content}
          </MarkdownRenderer>
        </div>
      </div>
    </motion.article>
  );
}

export default function WhatsNewPage() {
  const { entries, isLoading } = useWhatsNewPublished();

  if (isLoading) return <Loader message="Loading updates..." />;

  return (
    <div className="min-h-[60vh] py-4 font-mono text-emerald-400 select-none relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-4">
          <Sparkles size={12} className="text-emerald-400 animate-pulse" />
          <span>CHANGELOG</span>
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white mb-2">
          What&apos;s New
        </h1>
        <p className="text-emerald-500/55 text-xs uppercase max-w-md mx-auto leading-relaxed">
          Stay up to date with the latest features, improvements, and bug fixes we&apos;ve shipped.
        </p>
      </motion.div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-3"
        >
          <div className="size-11 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Rocket size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">No updates yet</h3>
            <p className="text-[9px] text-emerald-500/60 uppercase">
              We&apos;re building something great. Check back soon for the latest news!
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="relative max-w-2xl mx-auto space-y-6 md:pl-4">
          {entries.map((entry, i) => (
            <EntryCard key={entry._id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
