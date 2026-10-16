"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Zap,
  Target,
  Layers,
  HelpCircle,
  BookOpen,
  Menu,
  Sparkles,
  Search,
  Compass,
  Trophy,
  Users,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Info,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

/* ═══════════════════ TOC DEFINITION ═══════════════════ */
interface SubItem {
  id: string;
  label: string;
}

interface TocItem {
  id: string;
  label: string;
  icon: any;
  subItems?: SubItem[];
}

const tocItems: TocItem[] = [
  {
    id: "getting-started",
    label: "Getting started",
    icon: Zap,
    subItems: [
      { id: "creating-an-account", label: "Creating an Account" },
      { id: "codeforces-verification", label: "Codeforces Verification" },
      { id: "syncing-profile", label: "Syncing Profile" },
    ],
  },
  {
    id: "training-engine",
    label: "Training sessions",
    icon: Target,
    subItems: [
      { id: "training-modes", label: "Training Modes" },
      { id: "solving-problems", label: "Solving Problems" },
      { id: "session-results", label: "Session Results" },
    ],
  },
  {
    id: "upsolve-challenge",
    label: "Upsolve challenge",
    icon: Layers,
    subItems: [
      { id: "upsolving-arena", label: "Upsolving Arena" },
      { id: "tracking-progress", label: "Tracking Progress" },
    ],
  },
  {
    id: "learning-trail",
    label: "Learning trail",
    icon: Compass,
    subItems: [
      { id: "roadmap-structure", label: "Roadmap Structure" },
      { id: "level-gates", label: "Level Checkpoints" },
    ],
  },
  {
    id: "progression-system",
    label: "Experience & progress",
    icon: Trophy,
    subItems: [
      { id: "xp-levels", label: "XP and Levels" },
      { id: "leaderboards", label: "Leaderboards" },
      { id: "tactical-levels", label: "Training levels" },
    ],
  },
  {
    id: "social-features",
    label: "Friends & profile",
    icon: Users,
    subItems: [
      { id: "friends-system", label: "Friends System" },
      { id: "profile-portals", label: "Public profiles" },
    ],
  },
  {
    id: "support-console",
    label: "Help & support",
    icon: HelpCircle,
    subItems: [
      { id: "signal-support", label: "Contact support" },
      { id: "system-notifications", label: "System Notifications" },
    ],
  },
];

/* ═══════════════════ HELPERS ═══════════════════ */
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const getTextFromNode = (node: any): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getTextFromNode).join("");
  if (typeof node === "object" && node.props && node.props.children) {
    return getTextFromNode(node.props.children);
  }
  return "";
};

const getAnchorId = (children: any): string | undefined => {
  if (!children) return undefined;
  const childrenArray = Array.isArray(children) ? children : [children];
  for (const child of childrenArray) {
    if (child && typeof child === "object") {
      if (
        child.type === "a" &&
        child.props &&
        (child.props.name || child.props.id)
      ) {
        return child.props.name || child.props.id;
      }
      if (child.props && child.props.children) {
        const id = getAnchorId(child.props.children);
        if (id) return id;
      }
    }
  }
  return undefined;
};

const parseContentIntoSectors = (content: string) => {
  const rawSections = content.split(/(?=^## )/m);
  const sectors: Record<string, string> = {};

  sectors["intro"] = rawSections[0] || "";

  rawSections.slice(1).forEach((sec) => {
    const match = sec.match(
      /^##\s+(.*?)\s+(?:<a\s+name="(.*?)">|<a\s+id="(.*?)">|$)/m,
    );
    if (match) {
      const headingText = match[1];
      const anchorName = match[2] || match[3] || slugify(headingText);
      sectors[anchorName] = sec;
    }
  });

  return sectors;
};

const getSubHeadings = (sectorMarkdown: string) => {
  if (!sectorMarkdown) return [];
  const lines = sectorMarkdown.split("\n");
  return lines
    .filter((line) => line.startsWith("### "))
    .map((line) => {
      const text = line
        .replace("### ", "")
        .replace(/<[^>]*>/g, "")
        .trim();
      const anchor = line.match(/<a\s+(?:name|id)="([^"]+)"/);
      const id = anchor?.[1] || slugify(text);
      return { id, label: text };
    });
};

/* ═══════════════════ COPY BUTTON COMPONENT ═══════════════════ */
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium tracking-normal border rounded-xl transition-all active:scale-95 duration-200",
        copied
          ? "bg-[#b5e3c4]/10 border-[#2b3031] text-[#b5e3c4]"
          : "bg-[#b5e3c4]/5 border-[#2b3031] text-[#929b98] hover:text-[#b5e3c4] hover:border-[#69746e]",
      )}
    >
      {copied ? (
        <>
          <Check size={13} className="text-[#b5e3c4]" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

interface ClientPageProps {
  content: string;
}

export default function ClientPage({ content }: Readonly<ClientPageProps>) {
  const sectors = parseContentIntoSectors(content);
  const [activeTab, setActiveTab] = useState<string>("getting-started");
  const [activeSub, setActiveSub] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const filterInputRef = useRef<HTMLInputElement>(null);
  const contentPaneRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Focus filter input on "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLElement &&
        (activeElement.matches("input, textarea, select") ||
          activeElement.isContentEditable);
      if (e.key === "/" && !isEditing) {
        e.preventDefault();
        if (window.innerWidth < 1024) setMobileMenuOpen(true);
        else filterInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeMarkdown = sectors[activeTab] || "";
  const subHeadings = getSubHeadings(activeMarkdown);

  // Scrollspy to detect visible headings
  useEffect(() => {
    const pane = contentPaneRef.current;
    if (!pane) return;

    const headings = pane.querySelectorAll("h3[id]");
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerOptions = {
      root: null,
      rootMargin: "-90px 0px -75% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const intersecting = entries.find((entry) => entry.isIntersecting);
      if (intersecting) {
        setActiveSub(intersecting.target.id);
      }
    }, observerOptions);

    headings.forEach((heading) => observerRef.current?.observe(heading));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveSub("");
    setMobileMenuOpen(false);

    const manualElement = document.getElementById("manual-view-console");
    if (manualElement) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = manualElement.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToSub = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSub(id);
    }
  };

  // Heading Renderer
  const HeadingRenderer = ({ level, children, ...props }: any) => {
    const text = getTextFromNode(children);
    const anchorId = getAnchorId(children);
    const id = anchorId || slugify(text);

    const Tag = `h${level}` as any;
    const classes = cn(
      "font-medium tracking-tight text-[#f1f3ee] relative group flex items-center gap-2 font-heading ",
      {
        "text-2xl mt-10 mb-5 border-b border-[#2b3031] pb-2 scroll-mt-24 text-[#b5e3c4]":
          level === 2,
        "text-xl mt-8 mb-4 scroll-mt-28 text-[#b5e3c4]": level === 3,
        "text-lg mt-6 mb-3 text-[#b5e3c4] scroll-mt-28": level === 4,
      },
    );

    return (
      <Tag id={id} className={classes} {...props}>
        <span className="flex-1">{children}</span>
        {level === 3 && (
          <a
            href={`#${id}`}
            onClick={(e) => handleScrollToSub(e, id)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[#929b98] hover:text-[#f1f3ee] font-medium text-xs "
            aria-label="Link to section"
          >
            #
          </a>
        )}
      </Tag>
    );
  };

  // Search filter
  const searchResults = searchQuery
    ? tocItems
        .flatMap((item) => {
          const sectorContent = sectors[item.id] || "";
          const lines = sectorContent.split("\n");
          const matches = lines
            .filter(
              (line) =>
                line.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !line.startsWith("#") &&
                line.trim().length > 3,
            )
            .map((line) => {
              const cleanLine = line.replace(/[#*`[\]]/g, "").trim();
              return {
                sectorId: item.id,
                sectorLabel: item.label,
                text: cleanLine,
              };
            });
          return matches;
        })
        .slice(0, 5)
    : [];

  const activeIdx = tocItems.findIndex((item) => item.id === activeTab);
  const prevSection = activeIdx > 0 ? tocItems[activeIdx - 1] : null;
  const nextSection =
    activeIdx < tocItems.length - 1 ? tocItems[activeIdx + 1] : null;

  const customMarkdownComponents = {
    h2: (props: any) => <HeadingRenderer level={2} {...props} />,
    h3: (props: any) => <HeadingRenderer level={3} {...props} />,
    h4: (props: any) => <HeadingRenderer level={4} {...props} />,
    table: ({ children }: any) => (
      <div className="my-6 w-full overflow-hidden rounded-xl border border-[#2b3031] bg-[#101214]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm border-collapse text-left">
            {children}
          </table>
        </div>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-[#b5e3c4]/5 text-[#b5e3c4] font-medium tracking-normal border-b border-[#2b3031]">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-[#2b3031]">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-[#b5e3c4]/[0.02] transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 font-medium text-[#f1f3ee]">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-[#a8b1ac] leading-relaxed">{children}</td>
    ),
    blockquote: ({ children }: any) => {
      const text = getTextFromNode(children);
      const isNote = text.toLowerCase().includes("note:");
      const isTip = text.toLowerCase().includes("tip:");
      const isAdmin =
        text.toLowerCase().includes("admin") ||
        text.toLowerCase().includes("checkpoint");

      let alertTitle = "Notification";
      let AlertIcon = Info;
      let alertColors = "bg-[#b5e3c4]/5 border-[#2b3031] text-[#b5e3c4]";
      let titleColors = "text-[#b5e3c4]";

      if (isNote) {
        alertTitle = "Note";
        AlertIcon = Info;
        alertColors = "bg-[#101214] border-[#2b3031] text-[#b5e3c4]";
        titleColors = "text-[#b5e3c4]";
      } else if (isTip) {
        alertTitle = "Tip";
        AlertIcon = Lightbulb;
        alertColors = "bg-[#b5e3c4]/5 border-[#2b3031] text-[#929b98]";
        titleColors = "text-[#b5e3c4]";
      } else if (isAdmin) {
        alertTitle = "Please note";
        AlertIcon = AlertCircle;
        alertColors = "bg-[#d5b98a]/5 border-[#d5b98a]/20 text-[#d5b98a]";
        titleColors = "text-[#d5b98a]";
      }

      return (
        <div
          className={cn(
            "my-6 p-4 rounded-xl border flex gap-3.5 items-start font-sans text-xs leading-relaxed",
            alertColors,
          )}
        >
          <div className="p-1.5 rounded-xl bg-[#b5e3c4]/5 border border-[#2b3031] shrink-0">
            <AlertIcon className={cn("size-3.5", titleColors)} />
          </div>
          <div className="space-y-1 flex-1">
            <span
              className={cn(
                "text-xs font-medium tracking-normal block",
                titleColors,
              )}
            >
              {alertTitle}
            </span>
            <div>{children}</div>
          </div>
        </div>
      );
    },
    code: ({ className, children, ...props }: any) => {
      const codeString = String(children).replace(/\n$/, "");
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "bash";
      const isCodeBlock = match || String(children).includes("\n");

      if (isCodeBlock) {
        return (
          <div className="relative my-6 rounded-xl border border-[#2b3031] bg-[#101214] overflow-hidden group font-mono text-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-[#191c1e] border-b border-[#2b3031]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium tracking-normal text-[#929b98] font-sans">
                  {language}
                </span>
              </div>
              <div className="transition-opacity duration-200">
                <CopyButton text={codeString} />
              </div>
            </div>
            <pre className="overflow-x-auto p-4 font-mono leading-relaxed bg-[#101214] text-[#b5e3c4]">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      return (
        <code
          className="px-1.5 py-0.5 rounded-xl bg-[#b5e3c4]/5 border border-[#2b3031] font-mono text-sm text-[#b5e3c4] "
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children, ...props }: any) => {
      const isInternal = href?.startsWith("#");
      return (
        <a
          href={href}
          onClick={
            isInternal && href
              ? (e) => handleScrollToSub(e, href.substring(1))
              : undefined
          }
          className="text-[#b5e3c4] hover:text-[#f1f3ee] font-medium transition-colors underline decoration-[#b5e3c4]/40 underline-offset-4"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="relative min-h-screen pt-12 sm:pt-20 pb-20 font-sans text-[#f1f3ee] ">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        {/* Header Block */}
        <div className="space-y-5 mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#2b3031] bg-[#b5e3c4]/5 text-[#b5e3c4] text-xs font-medium tracking-normal rounded-xl">
            <Sparkles className="size-3" />
            <span>Documentation</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
            Get to know Upsolve.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#929b98]">
            Everything you need to build a practice routine, track your
            progress, and make the most of Upsolve.it.
          </p>
        </div>

        {/* Documentation layout */}
        <div
          id="manual-view-console"
          className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_180px] gap-6 items-start"
        >
          {/* Section navigation */}
          <aside className="hidden lg:block sticky top-[100px] z-30 pr-1 space-y-4">
            <div className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-4 space-y-4 ">
              <div className="flex items-center gap-2 px-0.5">
                <BookOpen className="size-3.5 text-[#b5e3c4]" />
                <span className="text-xs font-medium tracking-normal text-[#f1f3ee]">
                  Explore the guide
                </span>
              </div>

              {/* Search documentation */}
              <div className="relative group w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#929b98] group-focus-within:text-[#b5e3c4] transition-colors" />
                <input
                  ref={filterInputRef}
                  type="text"
                  placeholder="Search the guide…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search documentation"
                  className="w-full h-10 pl-8 pr-2 bg-[#101214] border border-[#2b3031] rounded-xl text-xs focus:outline-none focus:border-[#b5e3c4] transition-all font-medium text-[#b5e3c4] placeholder:text-[#929b98]"
                />

                {/* Floating Search Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[#2b3031] bg-[#191c1e] p-1.5 z-50 shadow-2xl max-h-56 overflow-y-auto space-y-1">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleTabChange(result.sectorId);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#b5e3c4]/10 transition-colors text-xs space-y-0.5"
                      >
                        <span className="font-medium text-[#b5e3c4] block">
                          {result.sectorLabel}
                        </span>
                        <span className="text-[#929b98] font-medium block truncate">
                          {result.text}
                        </span>
                      </button>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="text-xs text-center text-[#929b98] font-medium py-2">
                        No matching sections
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-[#b5e3c4]/10 w-full" />

              {/* Sections */}
              <nav className="space-y-1">
                {tocItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all border text-left group ",
                        isActive
                          ? "bg-[#b5e3c4]/10 border-[#2b3031] text-[#b5e3c4]"
                          : "text-[#929b98] border-transparent hover:text-[#b5e3c4] hover:bg-[#b5e3c4]/5",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <item.icon className="size-3 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={cn(
                          "opacity-20 group-hover:opacity-70 transition-all",
                          isActive
                            ? "rotate-90 text-[#b5e3c4] opacity-100"
                            : "",
                        )}
                      />
                    </button>
                  );
                })}
              </nav>

              <div className="h-[1px] bg-[#b5e3c4]/10 w-full" />

              {/* Support CTA card */}
              <div className="p-3.5 rounded-xl border border-[#2b3031] bg-[#b5e3c4]/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[#b5e3c4]">
                  <HelpCircle className="size-3.5" />
                  <span className="text-xs font-medium tracking-normal">
                    Need a hand?
                  </span>
                </div>
                <p className="text-xs text-[#929b98] leading-relaxed font-medium">
                  Can’t find what you need? Send us a message and we’ll help you
                  out.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full rounded-xl text-sm"
                >
                  <Link href="/help/support">Contact support</Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Guide content */}
          <div
            ref={contentPaneRef}
            className="min-w-0 w-full rounded-2xl border border-[#2b3031] bg-[#191c1e] p-5 sm:p-8 relative"
          >
            {/* Current section */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2b3031]">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#929b98] tracking-normal">
                  You’re reading
                </span>
                <span className="text-sm font-medium text-[#f1f3ee] tracking-tight mt-0.5">
                  {tocItems.find((item) => item.id === activeTab)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-xl bg-[#b5e3c4]/5 border border-[#2b3031] text-[#b5e3c4]">
                  User guide
                </span>
              </div>
            </div>

            {/* Markdown Body */}
            <article className="prose prose-invert max-w-none prose-headings:font-medium prose-p:text-[#a8b1ac] prose-p:leading-relaxed prose-p:text-sm prose-strong:text-[#f1f3ee] prose-strong:font-medium prose-ul:list-disc prose-ol:list-decimal prose-li:text-[#a8b1ac] prose-li:text-sm text-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={customMarkdownComponents as any}
              >
                {activeMarkdown}
              </ReactMarkdown>
            </article>

            {/* Quick Explore the guide Footer */}
            <div className="mt-12 pt-6 border-t border-[#2b3031] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevSection ? (
                <button
                  onClick={() => handleTabChange(prevSection.id)}
                  className="group flex flex-col items-start p-4 rounded-xl border border-[#2b3031] bg-[#191c1e] hover:bg-[#b5e3c4]/5 hover:border-[#69746e] transition-all duration-300 text-left font-sans"
                >
                  <span className="text-xs font-medium tracking-normal text-[#929b98] flex items-center gap-1 group-hover:text-[#b5e3c4] transition-colors">
                    <ArrowLeft size={14} /> Previous section
                  </span>
                  <span className="text-xs font-medium text-[#f1f3ee] mt-1 truncate w-full ">
                    {prevSection.label}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextSection ? (
                <button
                  onClick={() => handleTabChange(nextSection.id)}
                  className="group flex flex-col items-end p-4 rounded-xl border border-[#2b3031] bg-[#191c1e] hover:bg-[#b5e3c4]/5 hover:border-[#69746e] transition-all duration-300 text-right font-sans"
                >
                  <span className="text-xs font-medium tracking-normal text-[#929b98] flex items-center gap-1 group-hover:text-[#b5e3c4] transition-colors">
                    Next section <ArrowRight size={14} />
                  </span>
                  <span className="text-xs font-medium text-[#f1f3ee] mt-1 truncate w-full ">
                    {nextSection.label}
                  </span>
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Column 3: Right "On this page" Subsection Navigation */}
          <aside className="hidden xl:block sticky top-[100px] z-30 pl-1 space-y-4">
            {subHeadings.length > 0 && (
              <div className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-4 space-y-3 ">
                <span className="text-xs font-medium tracking-normal text-[#929b98] block">
                  On this page
                </span>

                <nav className="space-y-2 border-l border-[#2b3031] pl-2 text-xs font-medium">
                  {subHeadings.map((sub) => {
                    const isSubActive = activeSub === sub.id;
                    return (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        onClick={(e) => handleScrollToSub(e, sub.id)}
                        className={cn(
                          "block transition-all border-l-2 -ml-[9px] pl-[9px] py-0.5",
                          isSubActive
                            ? "text-[#b5e3c4] border-[#2b3031]"
                            : "text-[#929b98] border-transparent hover:text-[#b5e3c4]",
                        )}
                      >
                        {sub.label}
                      </a>
                    );
                  })}
                </nav>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="fixed bottom-20 right-5 z-50 lg:hidden">
          <SheetTrigger asChild>
            <Button
              className="flex size-11 items-center justify-center rounded-xl border border-[#2b3031] bg-[#b5e3c4] text-[#101214] shadow-lg transition-colors hover:bg-[#ceedd8]"
              aria-label="Table of contents"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent
          side="right"
          className="flex h-dvh w-[calc(100%-1rem)] max-w-xs flex-col gap-5 overflow-y-auto border-[#2b3031] bg-[#191c1e] p-5 font-sans text-[#f1f3ee] sm:max-w-xs"
        >
          <SheetHeader className="border-b border-[#2b3031] pb-4 pr-6 text-left">
            <SheetTitle className="flex items-center gap-2 text-base font-medium">
              <BookOpen className="size-4 text-[#b5e3c4]" aria-hidden="true" />
              Explore the guide
            </SheetTitle>
            <SheetDescription className="sr-only">
              Choose a documentation section to read.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#929b98]"
                aria-hidden="true"
              />
              <input
                aria-label="Search documentation"
                placeholder="Search the guide…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#2b3031] bg-[#101214] pl-10 pr-3 text-sm"
              />
            </div>
            {searchQuery && (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#2b3031] bg-[#101214] p-2">
                {searchResults.length ? (
                  searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleTabChange(result.sectorId);
                        setSearchQuery("");
                      }}
                      className="block w-full rounded-lg p-2 text-left hover:bg-[#b5e3c4]/5"
                    >
                      <span className="block text-sm text-[#b5e3c4]">
                        {result.sectorLabel}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#929b98]">
                        {result.text}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-2 text-sm text-[#929b98]">
                    No matching sections. Try another keyword.
                  </p>
                )}
              </div>
            )}
          </div>
          <nav
            aria-label="Documentation sections"
            className="flex-1 space-y-1.5 text-sm font-medium"
          >
            {tocItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]",
                    isActive
                      ? "border-[#b5e3c4]/30 bg-[#b5e3c4]/10 text-[#b5e3c4]"
                      : "border-transparent text-[#929b98] hover:bg-[#b5e3c4]/5 hover:text-[#f1f3ee]",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="border-t border-[#2b3031] pt-4">
            <Button
              asChild
              className="h-11 w-full rounded-xl bg-[#b5e3c4] text-sm text-[#101214] hover:bg-[#ceedd8]"
            >
              <Link href="/help/support">Contact support</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
