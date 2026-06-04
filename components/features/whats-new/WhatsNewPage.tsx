"use client";

import { useWhatsNewPublished, type WhatsNewEntry } from "@/hooks/admin";
import Loader from "@/components/shared/Loader";
import { m } from "framer-motion";
import { Sparkles, Calendar, Tag, Rocket } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function EntryCard({ entry, index }: { entry: WhatsNewEntry; index: number }) {
  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="group relative"
    >
      {/* Timeline dot + connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent hidden md:block" />
      <div className="absolute -left-[5px] top-8 size-[11px] rounded-full border-2 border-primary bg-background shadow-[0_0_12px_rgba(16,185,129,0.35)] hidden md:block" />

      <div
        className={cn(
          "relative md:ml-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden",
          "transition-all duration-300",
          "hover:border-primary/30 hover:shadow-[0_8px_40px_-12px_rgba(16,185,129,0.15)]",
        )}
      >
        {/* Top glow accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {entry.version && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
                <Tag size={12} />
                {entry.version}
              </span>
            )}
            {entry.publishedAt && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <Calendar size={12} className="opacity-60" />
                {formatDate(entry.publishedAt)}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
            {entry.title}
          </h2>
        </div>

        {/* Markdown Body */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-img:rounded-xl prose-blockquote:border-primary/30">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {entry.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </m.article>
  );
}

export default function WhatsNewPage() {
  const { entries, isLoading } = useWhatsNewPublished();

  if (isLoading) return <Loader message="Loading updates..." />;

  return (
    <div className="min-h-[60vh] py-4">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Changelog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
          What&apos;s New
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Stay up to date with the latest features, improvements, and fixes we&apos;ve shipped.
        </p>
      </m.div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Rocket size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            No updates yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We&apos;re building something great. Check back soon for the latest news!
          </p>
        </m.div>
      ) : (
        <div className="relative max-w-3xl mx-auto space-y-8 md:pl-6">
          {entries.map((entry, i) => (
            <EntryCard key={entry._id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
