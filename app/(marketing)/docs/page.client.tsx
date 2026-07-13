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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        "flex items-center gap-1 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-widest border rounded-sm transition-all active:scale-95 duration-200",
        copied
          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
          : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/60 hover:text-emerald-400 hover:border-emerald-500/40"
      )}
    >
      {copied ? (
        <>
          <Check size={8} className="text-emerald-400" />
          <span>[ COPIED ]</span>
        </>
      ) : (
        <>
          <Copy size={8} />
          <span>[ COPY ]</span>
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

  // Heading Renderer
  const HeadingRenderer = ({ level, children, ...props }: any) => {
    const text = getTextFromNode(children);
    const anchorId = getAnchorId(children);
    const id = anchorId || slugify(text);

    const Tag = `h${level}` as any;
    const classes = cn(
      "font-bold tracking-tight text-white relative group flex items-center gap-2 font-mono uppercase",
      {
        "text-lg mt-10 mb-4 border-b border-emerald-500/10 pb-2 scroll-mt-24 text-emerald-350": level === 2,
        "text-sm mt-8 mb-3 scroll-mt-28 text-emerald-400": level === 3,
        "text-xs mt-6 mb-2 text-emerald-450 scroll-mt-28": level === 4,
      }
    );

    return (
      <Tag id={id} className={classes} {...props}>
        <span className="flex-1">
          {level === 2 && <span className="text-emerald-500/35 mr-1.5">{"//"}</span>}
          {children}
        </span>
        {level === 3 && (
          <a
            href={`#${id}`}
            onClick={(e) => handleScrollToSub(e, id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 hover:text-white font-medium text-xs select-none"
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

  const customMarkdownComponents = {
    h2: (props: any) => <HeadingRenderer level={2} {...props} />,
    h3: (props: any) => <HeadingRenderer level={3} {...props} />,
    h4: (props: any) => <HeadingRenderer level={4} {...props} />,
    table: ({ children }: any) => (
      <div className="my-6 w-full overflow-hidden rounded-sm border border-emerald-500/15 bg-[#040604]/50">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] border-collapse text-left">{children}</table>
        </div>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-emerald-500/5 text-emerald-400 font-bold uppercase tracking-wider border-b border-emerald-500/15">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-emerald-500/5">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-emerald-500/[0.02] transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-2.5 font-bold">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-2.5 text-emerald-300 font-medium leading-relaxed">{children}</td>
    ),
    blockquote: ({ children }: any) => {
      const text = getTextFromNode(children);
      const isNote = text.toLowerCase().includes("note:");
      const isTip = text.toLowerCase().includes("tip:");
      const isAdmin = text.toLowerCase().includes("admin") || text.toLowerCase().includes("checkpoint");

      let alertTitle = "Notification";
      let AlertIcon = Info;
      let alertColors = "bg-emerald-500/5 border-emerald-500/10 text-emerald-300";
      let titleColors = "text-emerald-400";

      if (isNote) {
        alertTitle = "Note";
        AlertIcon = Info;
        alertColors = "bg-[#040604] border-emerald-500/15 text-emerald-300";
        titleColors = "text-emerald-400";
      } else if (isTip) {
        alertTitle = "Tip";
        AlertIcon = Lightbulb;
        alertColors = "bg-emerald-500/5 border-emerald-500/15 text-emerald-300/90";
        titleColors = "text-emerald-400";
      } else if (isAdmin) {
        alertTitle = "Alert Protocol";
        AlertIcon = AlertCircle;
        alertColors = "bg-amber-500/5 border-amber-500/15 text-amber-250/90";
        titleColors = "text-amber-400";
      }

      return (
        <div className={cn("my-6 p-4 rounded-sm border flex gap-3.5 items-start font-mono text-[9px] uppercase leading-relaxed", alertColors)}>
          <div className="p-1.5 rounded-sm bg-emerald-500/5 border border-emerald-500/10 shrink-0">
            <AlertIcon className={cn("size-3.5", titleColors)} />
          </div>
          <div className="space-y-1 flex-1">
            <span className={cn("text-[8px] font-bold tracking-wider block", titleColors)}>
              {`[ ${alertTitle} ]`}
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
          <div className="relative my-6 rounded-sm border border-emerald-500/15 bg-[#040604] overflow-hidden group font-mono text-[10px]">
            <div className="flex items-center justify-between px-3 py-2 bg-[#060a08] border-b border-emerald-500/10">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 font-mono">
                  {`// ${language}`}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <CopyButton text={codeString} />
              </div>
            </div>
            <pre className="overflow-x-auto p-4 leading-relaxed bg-[#040604] text-emerald-300">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      return (
        <code className="px-1.5 py-0.5 rounded-sm bg-emerald-500/5 border border-emerald-500/15 font-mono text-[9px] text-emerald-400 font-bold uppercase" {...props}>
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
          className="text-emerald-400 hover:text-white font-bold transition-colors underline decoration-emerald-500/30 underline-offset-4 font-mono"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 font-mono text-emerald-400 select-none">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 text-emerald-450 text-[9px] font-bold uppercase tracking-widest rounded-sm">
            <Sparkles className="size-3" />
            <span>[ SYSTEM_PROTOCOL_MANUAL ]</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white uppercase leading-[0.9] select-none">
            {"> "}MAN_SYSTEM_PROTOCOL.SH
          </h1>
          <p className="text-emerald-500/50 uppercase max-w-lg mx-auto text-[10px] leading-relaxed">
            Detailed guides and control logs to navigate the modules of the Upsolve.it dashboard.
          </p>
        </div>

        {/* Command Console Layout */}
        <div id="manual-view-console" className="grid grid-cols-1 lg:grid-cols-[250px_1fr_200px] gap-6 items-start">
          
          {/* Column 1: Left Navigation Console Channels */}
          <aside className="hidden lg:block sticky top-[100px] z-30 pr-1 space-y-4">
            <div className="rounded-sm border border-emerald-500/15 bg-[#060a08]/30 p-4 space-y-4 shadow-[0_6px_22px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 px-0.5">
                <BookOpen className="size-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                  Sector Navigation
                </span>
              </div>

              {/* Console Search Engine */}
              <div className="relative group w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/40 group-focus-within:text-emerald-450 transition-colors" />
                <input
                  ref={filterInputRef}
                  type="text"
                  placeholder="Filter manual... (Press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 bg-[#040604] border border-emerald-500/20 rounded-sm text-[9px] focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-emerald-300 placeholder:text-emerald-500/25"
                />

                {/* Floating Search Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-sm border border-emerald-500/20 bg-[#060a08] p-1.5 z-50 shadow-2xl max-h-56 overflow-y-auto space-y-1">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleTabChange(result.sectorId);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2 rounded-sm hover:bg-emerald-500/10 transition-colors text-[9px] space-y-0.5"
                      >
                        <span className="font-bold text-emerald-400 uppercase block">
                          {result.sectorLabel}
                        </span>
                        <span className="text-emerald-500/40 font-bold block truncate">
                          {result.text}
                        </span>
                      </button>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="text-[8px] text-center text-emerald-500/30 font-bold py-2">
                        NO DIAGNOSTICS FOUND
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-emerald-500/10 w-full" />

              {/* Channels Nav List */}
              <nav className="space-y-1">
                {tocItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-[9px] font-bold transition-all border text-left group uppercase",
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "text-emerald-550 border-transparent hover:text-emerald-400 hover:bg-emerald-500/5"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <item.icon className="size-3 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight size={10} className={cn(
                        "opacity-20 group-hover:opacity-70 transition-all",
                        isActive ? "rotate-90 text-emerald-400 opacity-100" : ""
                      )} />
                    </button>
                  );
                })}
              </nav>

              <div className="h-[1px] bg-emerald-500/10 w-full" />

              {/* Support CTA card */}
              <div className="p-3.5 rounded-sm border border-emerald-500/10 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <HelpCircle className="size-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">ASSISTANCE</span>
                </div>
                <p className="text-[8px] text-emerald-500/50 leading-relaxed font-bold">
                  Can't find what you need? Open a support ticket directly with our engineering team.
                </p>
                <Link href="/help/support" className="block">
                  <Button variant="outline" className="w-full h-8 rounded-sm border-emerald-500/20 text-[8px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all font-mono">
                    [ CONSOLE_TICKET ]
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Column 2: Center Content Pane Console */}
          <main 
            ref={contentPaneRef}
            className="w-full rounded-sm border border-emerald-500/15 bg-[#060a08]/30 p-6 sm:p-8 shadow-[0_6px_22px_rgba(0,0,0,0.6)] relative"
          >
            {/* Terminal Header Telemetry */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-wider">
                  Manual Sector
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-tight mt-0.5">
                  {tocItems.find((item) => item.id === activeTab)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-sm bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                  STATUS: VERIFIED
                </span>
              </div>
            </div>

            {/* Markdown Body */}
            <article className="prose prose-invert max-w-none prose-headings:font-bold prose-p:text-emerald-300/80 prose-p:leading-relaxed prose-p:text-xs prose-strong:text-white prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal prose-li:text-emerald-350 prose-li:text-xs text-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={customMarkdownComponents as any}
              >
                {activeMarkdown}
              </ReactMarkdown>
            </article>

            {/* Quick Sector Navigation Footer */}
            <div className="mt-12 pt-6 border-t border-emerald-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevSection ? (
                <button
                  onClick={() => handleTabChange(prevSection.id)}
                  className="group flex flex-col items-start p-4 rounded-sm border border-emerald-500/10 bg-[#060a08]/50 hover:bg-emerald-500/5 hover:border-emerald-500/25 transition-all duration-300 text-left font-mono"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                    <ArrowLeft size={10} /> Previous Sector
                  </span>
                  <span className="text-xs font-bold text-white mt-1 truncate w-full uppercase">
                    {prevSection.label}
                  </span>
                </button>
              ) : <div />}

              {nextSection ? (
                <button
                  onClick={() => handleTabChange(nextSection.id)}
                  className="group flex flex-col items-end p-4 rounded-sm border border-emerald-500/10 bg-[#060a08]/50 hover:bg-emerald-500/5 hover:border-emerald-500/25 transition-all duration-300 text-right font-mono"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                    Next Sector <ArrowRight size={10} />
                  </span>
                  <span className="text-xs font-bold text-white mt-1 truncate w-full uppercase">
                    {nextSection.label}
                  </span>
                </button>
              ) : <div />}
            </div>
          </main>

          {/* Column 3: Right "On this page" Subsection Navigation */}
          <aside className="hidden lg:block sticky top-[100px] z-30 pl-1 space-y-4">
            {subHeadings.length > 0 && (
              <div className="rounded-sm border border-emerald-500/15 bg-[#060a08]/30 p-4 space-y-3 shadow-[0_6px_22px_rgba(0,0,0,0.6)]">
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 block">
                  On This Page
                </span>
                
                <nav className="space-y-2 border-l border-emerald-500/10 pl-2 text-[9px] uppercase font-bold">
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
                            ? "text-emerald-400 border-emerald-400"
                            : "text-emerald-550 border-transparent hover:text-emerald-400"
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

      {/* Floating Button on Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setMobileMenuOpen(true)}
          className="size-11 rounded-sm shadow-2xl bg-emerald-500 text-emerald-950 border border-emerald-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all font-mono"
          aria-label="Table of contents"
        >
          <Menu className="size-4" />
        </Button>
      </div>

      {/* Mobile Sidebar drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto h-full w-[260px] max-w-full bg-[#060a08] border-l border-emerald-500/25 p-5 flex flex-col gap-5 shadow-2xl z-10 overflow-y-auto font-mono text-emerald-400">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Sector Channels
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-7 rounded-sm flex items-center justify-center hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-500/60 hover:text-emerald-400"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1 uppercase text-[9px] font-bold">
              {tocItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-2 rounded-sm border text-left",
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "text-emerald-550 border-transparent hover:bg-emerald-500/5 hover:text-emerald-400"
                    )}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-emerald-500/10">
              <Link href="/help/support" className="block">
                <Button className="w-full h-9 rounded-sm bg-emerald-500 text-emerald-950 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all font-mono">
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
