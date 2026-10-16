"use client";

import Link from "next/link";
import { useWhatsNewPublished, type WhatsNewEntry } from "@/hooks/admin";
import { m as motion } from "framer-motion";
import { ArrowUpRight, RefreshCw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import StudioMascot from "@/components/shared/StudioMascot";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EntryCard({ entry, index }: { entry: WhatsNewEntry; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="grid gap-4 border-t border-[#2b3031] pt-8 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8"
    >
      <div className="flex items-center gap-3 text-sm text-[#929b98] md:flex-col md:items-start">
        {entry.publishedAt && (
          <time
            dateTime={entry.publishedAt}
            className="inline-flex items-center gap-2"
          >
            <CalendarDays className="size-4 md:hidden" aria-hidden="true" />
            {formatDate(entry.publishedAt)}
          </time>
        )}
        {entry.version && (
          <span className="rounded-lg border border-[#2b3031] bg-[#b5e3c4]/5 px-2.5 py-1 text-xs font-medium text-[#b5e3c4]">
            Version {entry.version}
          </span>
        )}
      </div>
      <div className="min-w-0 rounded-2xl border border-[#2b3031] bg-[#191c1e] p-5 sm:p-8">
        <h2 className="mb-5 font-heading text-2xl font-medium leading-snug tracking-tight text-[#f1f3ee]">
          {entry.title}
        </h2>
        <MarkdownRenderer className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-7 text-[#a8b1ac] prose-headings:font-heading prose-headings:font-medium prose-headings:text-[#f1f3ee] prose-a:text-[#b5e3c4] prose-a:underline prose-code:rounded prose-code:bg-[#101214] prose-code:px-1 prose-code:py-0.5 prose-code:text-[#b5e3c4] prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-[#2b3031] prose-pre:bg-[#101214] prose-img:rounded-xl prose-blockquote:border-[#b5e3c4]/30">
          {entry.content}
        </MarkdownRenderer>
      </div>
    </motion.article>
  );
}

export default function WhatsNewPage() {
  const { entries, isLoading, isError, mutate } = useWhatsNewPublished();

  return (
    <div className="relative mx-auto max-w-5xl space-y-10 py-4 font-sans text-[#f1f3ee]">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium text-[#b5e3c4]">
            Product notes
          </p>
          <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl">
            Always a little better.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#929b98]">
            New features, thoughtful improvements, and the small fixes that make
            practice feel better.
          </p>
        </div>
        <Link
          href="/suggestions"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-[#b5e3c4] hover:text-[#ceedd8]"
        >
          Share an idea <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {isLoading ? (
        <div role="status" className="space-y-6">
          <span className="sr-only">Loading updates</span>
          {[0, 1].map((item) => (
            <div
              key={item}
              aria-hidden="true"
              className="space-y-4 rounded-2xl border border-[#2b3031] bg-[#191c1e] p-8"
            >
              <div className="h-3 w-24 animate-pulse rounded bg-[#2b3031] motion-reduce:animate-none" />
              <div className="h-7 w-2/3 animate-pulse rounded bg-[#2b3031] motion-reduce:animate-none" />
              <div className="h-20 animate-pulse rounded-lg bg-[#2b3031]/50 motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#2b3031] bg-[#191c1e] px-6 py-12 text-center"
        >
          <h2 className="font-heading text-2xl font-medium">
            Updates couldn’t load.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#929b98]">
            Please try again to see the latest changes.
          </p>
          <Button
            variant="outline"
            onClick={() => void mutate()}
            className="mt-6 rounded-xl"
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#2b3031] bg-[#191c1e] px-6 py-10 text-center sm:flex-row sm:gap-8 sm:px-10 sm:text-left">
          <StudioMascot pose="think" className="w-32 shrink-0 sm:w-40" />
          <div>
            <h2 className="font-heading text-2xl font-medium">
              A new chapter is on its way.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#929b98]">
              When we release something new, you’ll find the details here. In
              the meantime, make yourself at home.
            </p>
            <Link
              href="/training"
              className="mt-5 inline-flex items-center gap-2 text-sm text-[#b5e3c4]"
            >
              Go to training{" "}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry, index) => (
            <EntryCard key={entry._id} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
