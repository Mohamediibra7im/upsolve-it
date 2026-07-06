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
  X,
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
import Orb from "@/components/features/landing/Orb";
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
    label: "Getting Started",
    icon: Zap,
    subItems: [
      { id: "creating-an-account", label: "Creating an Account" },
      { id: "codeforces-verification", label: "Codeforces Verification" },
      { id: "syncing-profile", label: "Syncing Profile" },
    ],
  },
  {
    id: "training-engine",
    label: "Core Training Engine",
    icon: Target,
    subItems: [
      { id: "training-modes", label: "Training Modes" },
      { id: "solving-problems", label: "Solving Problems" },
      { id: "session-results", label: "Session Results" },
    ],
  },
  {
    id: "upsolve-challenge",
    label: "Upsolve Challenge",
    icon: Layers,
    subItems: [
      { id: "upsolving-arena", label: "Upsolving Arena" },
      { id: "tracking-progress", label: "Tracking Progress" },
    ],
  },
  {
    id: "learning-trail",
    label: "Learning Trail",
    icon: Compass,
    subItems: [
      { id: "roadmap-structure", label: "Roadmap Structure" },
      { id: "level-gates", label: "Level Checkpoints" },
    ],
  },
  {
    id: "progression-system",
    label: "Gamification & Progress",
    icon: Trophy,
    subItems: [
      { id: "xp-levels", label: "XP and Levels" },
      { id: "leaderboards", label: "Leaderboards" },
      { id: "tactical-levels", label: "Tactical Levels" },
    ],
  },
  {
    id: "social-features",
    label: "Social & Identity",
    icon: Users,
    subItems: [
      { id: "friends-system", label: "Friends System" },
      { id: "profile-portals", label: "Profile Portals" },
    ],
  },
  {
    id: "support-console",
    label: "Support & Console",
    icon: HelpCircle,
    subItems: [
      { id: "signal-support", label: "Signal Support" },
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
      if (child.type === "a" && child.props && (child.props.name || child.props.id)) {
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

// Split raw GUIDE.md into mapped sectors
const parseContentIntoSectors = (content: string) => {
  const rawSections = content.split(/(?=^## )/m);
  const sectors: Record<string, string> = {};
  
  sectors["intro"] = rawSections[0] || "";
  
  rawSections.slice(1).forEach((sec) => {
    const match = sec.match(/^##\s+(.*?)\s+(?:<a\s+name="(.*?)">|<a\s+id="(.*?)">|$)/m);
    if (match) {
      const headingText = match[1];
      const anchorName = match[2] || match[3] || slugify(headingText);
      sectors[anchorName] = sec;
    }
  });
  
  return sectors;
};

// Get Subheadings from a sector's markdown
const getSubHeadings = (sectorMarkdown: string) => {
  if (!sectorMarkdown) return [];
  const lines = sectorMarkdown.split("\n");
  return lines
    .filter((line) => line.startsWith("### "))
    .map((line) => {
      const text = line.replace("### ", "").replace(/<[^>]*>/g, "").trim();
      const id = slugify(text);
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
        "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest border rounded-lg transition-all active:scale-95 duration-200 backdrop-blur-md shadow-sm",
        copied
          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
          : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
      )}
    >
      {copied ? (
        <>
          <Check size={10} className="text-emerald-400" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={10} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

interface ClientPageProps {
  content: string;
}

export default function ClientPage({ content }: ClientPageProps) {
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
      if (e.key === "/" && document.activeElement !== filterInputRef.current) {
        e.preventDefault();
        filterInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeMarkdown = sectors[activeTab] || "";
  const subHeadings = getSubHeadings(activeMarkdown);

  // Scrollspy to detect which subheading is visible in the viewport
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

  // Tab change scroll-to-top handler
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveSub("");
    setMobileMenuOpen(false);
    
    // Smooth scroll page to start of manual body
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

  // Scroll to sub-heading inside content pane
  const handleScrollToSub = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
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

  // Custom headings renderer
  const HeadingRenderer = ({ level, children, ...props }: any) => {
    const text = getTextFromNode(children);
    const anchorId = getAnchorId(children);
    const id = anchorId || slugify(text);

    const Tag = `h${level}` as any;
    const classes = cn(
      "font-black tracking-tight text-foreground relative group flex items-center gap-2.5",
      {
        "text-2xl sm:text-3xl mt-12 mb-6 border-b border-border/30 pb-3 scroll-mt-24": level === 2,
        "text-xl mt-10 mb-4 scroll-mt-28": level === 3,
        "text-lg mt-8 mb-3 text-foreground/80 scroll-mt-28": level === 4,
      }
    );

    return (
      <Tag id={id} className={classes} {...props}>
        <span className="flex-1">{children}</span>
        {level === 3 && (
          <a
            href={`#${id}`}
            onClick={(e) => handleScrollToSub(e, id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-emerald-400 font-medium text-sm select-none"
            aria-label="Link to section"
          >
            #
          </a>
        )}
      </Tag>
    );
  };

  // Search filter for full-text manual sectors
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
                line.trim().length > 3
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
  const nextSection = activeIdx < tocItems.length - 1 ? tocItems[activeIdx + 1] : null;

  // Custom components for Markdown parser
  const customMarkdownComponents = {
    h2: (props: any) => <HeadingRenderer level={2} {...props} />,
    h3: (props: any) => <HeadingRenderer level={3} {...props} />,
    h4: (props: any) => <HeadingRenderer level={4} {...props} />,
    table: ({ children }: any) => (
      <div className="my-8 w-full overflow-hidden rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">{children}</table>
        </div>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-primary/[0.04] text-foreground font-black uppercase text-[10px] tracking-wider border-b border-border/50">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-border/20">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-primary/[0.01] transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-5 py-4 font-bold">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-5 py-4 text-muted-foreground/90 font-medium leading-relaxed">{children}</td>
    ),
    blockquote: ({ children }: any) => {
      const text = getTextFromNode(children);
      const isNote = text.toLowerCase().includes("note:");
      const isTip = text.toLowerCase().includes("tip:");
      const isAdmin = text.toLowerCase().includes("admin") || text.toLowerCase().includes("checkpoint");

      let alertTitle = "Notification";
      let AlertIcon = Info;
      let alertColors = "bg-primary/[0.02] border-primary/20 text-foreground";
      let titleColors = "text-primary";

      if (isNote) {
        alertTitle = "Note";
        AlertIcon = Info;
        alertColors = "bg-sky-500/[0.03] border-sky-500/20 text-sky-200/90";
        titleColors = "text-sky-400";
      } else if (isTip) {
        alertTitle = "Tip";
        AlertIcon = Lightbulb;
        alertColors = "bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-200/90";
        titleColors = "text-emerald-400";
      } else if (isAdmin) {
        alertTitle = "Alert Protocol";
        AlertIcon = AlertCircle;
        alertColors = "bg-amber-500/[0.03] border-amber-500/20 text-amber-200/90";
        titleColors = "text-amber-400";
      }

      return (
        <div className={cn("my-8 p-5 rounded-2xl border backdrop-blur-md shadow-lg flex gap-4 items-start", alertColors)}>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <AlertIcon className={cn("size-4", titleColors)} />
          </div>
          <div className="space-y-1.5 flex-1 text-sm font-medium leading-relaxed">
            <span className={cn("text-xs font-black uppercase tracking-wider block", titleColors)}>
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
          <div className="relative my-8 rounded-2xl border border-border/40 bg-card/35 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-border/20">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500/70" />
                <span className="size-2 rounded-full bg-yellow-500/70" />
                <span className="size-2 rounded-full bg-green-500/70" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2 font-mono">
                  {language}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <CopyButton text={codeString} />
              </div>
            </div>
            <pre className="overflow-x-auto p-5 text-xs sm:text-sm font-mono leading-relaxed bg-black/20 text-muted-foreground">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      return (
        <code className="px-1.5 py-0.5 rounded-lg bg-primary/[0.08] border border-primary/15 font-mono text-xs text-primary font-bold tracking-tight" {...props}>
          {children}
        </code>
      );
    },
    a: ({ href, children, ...props }: any) => {
      const isInternal = href?.startsWith("#");
      return (
        <a
          href={href}
          onClick={isInternal && href ? (e) => handleScrollToSub(e, href.substring(1)) : undefined}
          className="text-primary hover:text-emerald-400 font-bold transition-colors underline decoration-primary/20 underline-offset-4"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20">
      {/* Decorative background glows */}
      <Orb className="size-[800px] bg-primary/8 -top-[10%] -left-[20%] pointer-events-none" />
      <Orb className="size-[600px] bg-emerald-500/5 bottom-[10%] -right-[10%] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        {/* Header Block */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl">
            <Sparkles className="size-3" />
            System Protocol Manual
          </div>
          <h1 className="text-5xl sm:text-7xl font-[1000] tracking-tighter text-foreground leading-[0.9] uppercase select-none">
            System <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">Manual</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto text-base">
            Detailed guides and control logs to navigate the modules of the Upsolve.it dashboard.
          </p>
        </div>

        {/* Command Console Layout */}
        <div id="manual-view-console" className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-8 items-start">
          
          {/* Column 1: Left Navigation Console Channels */}
          <aside className="hidden lg:block sticky top-[100px] z-30 pr-2 space-y-4">
            <div className="rounded-3xl border border-border/40 bg-card/25 backdrop-blur-xl p-5 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2 px-1">
                <BookOpen className="size-4 text-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">
                  Sector Navigation
                </span>
              </div>

              {/* Console Search Engine */}
              <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  ref={filterInputRef}
                  type="text"
                  placeholder="Filter manual... (Press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-white/5 border border-border/40 rounded-xl text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-foreground placeholder:text-muted-foreground/60"
                />

                {/* Floating Search Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-2xl p-2 z-50 shadow-2xl max-h-60 overflow-y-auto space-y-1">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleTabChange(result.sectorId);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-primary/10 transition-colors text-[10px] space-y-1"
                      >
                        <span className="font-black text-primary uppercase block tracking-wider">
                          {result.sectorLabel}
                        </span>
                        <span className="text-muted-foreground font-medium block truncate">
                          {result.text}
                        </span>
                      </button>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="text-[9px] text-center text-muted-foreground/60 font-medium py-3">
                        No matches inside document
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-border/20 w-full" />

              {/* Channels Nav List */}
              <nav className="space-y-1">
                {tocItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border text-left group",
                        isActive
                          ? "bg-primary/15 border-primary/20 text-primary shadow-[0_0_20px_rgba(0,127,95,0.05)]"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <item.icon className={cn(
                          "size-3.5 shrink-0 transition-colors",
                          isActive ? "text-primary animate-pulse" : "text-muted-foreground/60 group-hover:text-foreground/80"
                        )} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight size={12} className={cn(
                        "opacity-30 group-hover:opacity-75 transition-all",
                        isActive ? "rotate-90 text-primary opacity-100" : ""
                      )} />
                    </button>
                  );
                })}
              </nav>

              <div className="h-px bg-border/20 w-full" />

              {/* Support CTA card */}
              <div className="p-4 rounded-2xl border border-border/30 bg-primary/[0.02] space-y-2.5">
                <div className="flex items-center gap-2 text-primary">
                  <HelpCircle className="size-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Need Assistance?</span>
                </div>
                <p className="text-[9px] text-muted-foreground/80 leading-relaxed font-medium">
                  Can't find what you need? Open a support ticket directly with our engineering team.
                </p>
                <Link href="/help/support" className="block">
                  <Button variant="outline" className="w-full h-8 rounded-xl border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Column 2: Center Content Pane Console */}
          <main 
            ref={contentPaneRef}
            className="w-full rounded-[2rem] border border-border/40 bg-card/10 backdrop-blur-xl p-6 sm:p-10 shadow-2xl relative"
          >
            {/* Terminal Header Telemetry */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-border/20">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.25em]">
                  Manual Sector
                </span>
                <span className="text-base font-black text-foreground uppercase tracking-tight mt-0.5">
                  {tocItems.find((item) => item.id === activeTab)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground">
                  STATUS: VERIFIED
                </span>
              </div>
            </div>

            {/* Markdown Body */}
            <article className="prose prose-invert max-w-none prose-headings:font-black prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={customMarkdownComponents as any}
              >
                {activeMarkdown}
              </ReactMarkdown>
            </article>

            {/* Quick Sector Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-border/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevSection ? (
                <button
                  onClick={() => handleTabChange(prevSection.id)}
                  className="group flex flex-col items-start p-5 rounded-2xl border border-border/30 bg-card/5 hover:bg-primary/[0.02] hover:border-primary/20 transition-all duration-300 text-left"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    <ArrowLeft size={12} /> Previous Protocol
                  </span>
                  <span className="text-sm font-bold text-foreground mt-1.5 truncate w-full">
                    {prevSection.label}
                  </span>
                </button>
              ) : <div />}

              {nextSection ? (
                <button
                  onClick={() => handleTabChange(nextSection.id)}
                  className="group flex flex-col items-end p-5 rounded-2xl border border-border/30 bg-card/5 hover:bg-primary/[0.02] hover:border-primary/20 transition-all duration-300 text-right"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    Next Protocol <ArrowRight size={12} />
                  </span>
                  <span className="text-sm font-bold text-foreground mt-1.5 truncate w-full">
                    {nextSection.label}
                  </span>
                </button>
              ) : <div />}
            </div>
          </main>

          {/* Column 3: Right "On this page" Subsection Navigation */}
          <aside className="hidden lg:block sticky top-[100px] z-30 pl-2 space-y-4">
            {subHeadings.length > 0 && (
              <div className="rounded-3xl border border-border/40 bg-card/25 backdrop-blur-xl p-5 space-y-4 shadow-2xl">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block px-1">
                  On This Page
                </span>
                
                <nav className="space-y-2 border-l border-border/30 pl-3">
                  {subHeadings.map((sub) => {
                    const isSubActive = activeSub === sub.id;
                    return (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        onClick={(e) => handleScrollToSub(e, sub.id)}
                        className={cn(
                          "block text-[10px] font-bold tracking-tight transition-all border-l-2 -ml-3.5 pl-3.5 py-0.5",
                          isSubActive
                            ? "text-primary border-primary font-extrabold"
                            : "text-muted-foreground/60 border-transparent hover:text-foreground"
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

      {/* Floating Outline Button on Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setMobileMenuOpen(true)}
          className="size-12 rounded-full shadow-2xl bg-primary text-primary-foreground border border-primary-foreground/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Table of contents"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Mobile Sidebar overlay drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto h-full w-[280px] max-w-full bg-card border-l border-border/50 p-6 flex flex-col gap-6 shadow-2xl relative z-10 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                  Sector Channels
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-8 rounded-lg flex items-center justify-center hover:bg-white/5 border border-border/20 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {tocItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left",
                      isActive
                        ? "bg-primary/10 border-primary/15 text-primary"
                        : "text-muted-foreground border-transparent hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Support CTA inside Mobile Drawer */}
            <div className="pt-6 border-t border-border/20">
              <Link href="/help/support" className="block">
                <Button className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
