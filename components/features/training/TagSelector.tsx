"use client";

import { ProblemTag } from "@/types/Codeforces";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Hash,
  Binary,
  GitBranch,
  Calculator,
  Terminal,
  Zap,
  Filter
} from "lucide-react";
import { m } from "framer-motion";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Categorization Logic
const getTagCategory = (tagName: string) => {
  const name = tagName.toLowerCase();
  
  if (name.includes('dp') || name.includes('greedy') || name.includes('implementation') || name.includes('constructive') || name.includes('sort') || name.includes('search'))
    return { label: "Algorithms", icon: Zap, color: "text-amber-400", border: "border-amber-500/20" };
    
  if (name.includes('graph') || name.includes('tree') || name.includes('dsu') || name.includes('flows') || name.includes('shortest'))
    return { label: "Graphs & Trees", icon: GitBranch, color: "text-emerald-400", border: "border-emerald-500/20" };
    
  if (name.includes('math') || name.includes('number') || name.includes('combinatorics') || name.includes('geometry') || name.includes('probabilities'))
    return { label: "Math & Logic", icon: Calculator, color: "text-sky-400", border: "border-sky-500/20" };
    
  if (name.includes('string') || name.includes('hash') || name.includes('regex') || name.includes('expression'))
    return { label: "Strings", icon: Terminal, color: "text-rose-400", border: "border-rose-500/20" };
    
  if (name.includes('bitmask') || name.includes('binary') || name.includes('divide'))
    return { label: "Low Level", icon: Binary, color: "text-indigo-400", border: "border-indigo-500/20" };
    
  return { label: "General", icon: Hash, color: "text-slate-400", border: "border-slate-500/20" };
};

const TagSelector = ({
  allTags,
  selectedTags,
  onTagClick,
  onClearTags,
}: {
  allTags: ProblemTag[];
  selectedTags: ProblemTag[];
  onTagClick: (tag: ProblemTag) => void;
  onClearTags: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = useMemo(() => {
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTags, searchQuery]);

  const groupedTags = useMemo(() => {
    const groups: Record<string, { label: string; icon: any; color: string; border: string; tags: ProblemTag[] }> = {};
    
    filteredTags.forEach(tag => {
      const category = getTagCategory(tag.name);
      if (!groups[category.label]) {
        groups[category.label] = { ...category, tags: [] };
      }
      groups[category.label].tags.push(tag);
    });
    
    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredTags]);

  return (
    <div className="space-y-6 font-mono text-emerald-400">
      {/* Search & Stats Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            placeholder="search_topics --query=(e.g. dp)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-transparent border border-emerald-500/20 text-emerald-400 placeholder:text-emerald-500/35 focus:border-emerald-500/50 focus:ring-0 rounded font-mono"
          />
        </div>
        
        {selectedTags.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearTags}
            className="h-10 px-4 rounded border border-red-500/35 bg-[#060a08] text-red-400 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 active:scale-[0.98] transition-all font-mono whitespace-nowrap"
          >
            <Filter className="size-3.5 mr-2" />
            [ RESET_FILTERS.SH ({selectedTags.length}) ]
          </Button>
        )}
      </div>

      {/* Grouped Tags Scroll Area */}
      <ScrollArea className="h-[300px] pr-2">
        <div className="space-y-6 pb-6">
          {groupedTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 text-emerald-500/40">
              <Search className="size-6 opacity-40 animate-pulse" />
              <p className="text-xs">[ SEARCH_FAIL // NO TOPICS MATCHED ]</p>
            </div>
          ) : (
            groupedTags.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-2 px-1 select-none">
                  <group.icon className={cn("size-3.5", group.color)} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500/45">
                    {group.label}
                  </h4>
                  <div className="h-px flex-1 bg-emerald-500/10 ml-2" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const isSelected = selectedTags.some(t => t.value === tag.value);
                    return (
                      <m.button
                        key={tag.value}
                        onClick={() => onTagClick(tag)}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "relative px-3 py-1.5 rounded text-[10px] font-bold transition-all duration-200 border font-mono tracking-wider",
                          isSelected
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "bg-transparent border-emerald-500/15 text-emerald-500/50 hover:border-emerald-500/35 hover:text-emerald-400"
                        )}
                      >
                        {isSelected ? `[x] ${tag.name}` : `[ ] ${tag.name}`}
                      </m.button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TagSelector;
