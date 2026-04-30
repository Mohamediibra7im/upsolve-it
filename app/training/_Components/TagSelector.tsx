import { ProblemTag } from "@/types/Codeforces";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  X,
  Search,
  Hash,
  Binary,
  GitBranch,
  Calculator,
  Terminal,
  Zap,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Categorization Logic
const getTagCategory = (tagName: string) => {
  const name = tagName.toLowerCase();
  
  if (name.includes('dp') || name.includes('greedy') || name.includes('implementation') || name.includes('constructive') || name.includes('sort') || name.includes('search'))
    return { label: "Algorithms", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    
  if (name.includes('graph') || name.includes('tree') || name.includes('dsu') || name.includes('flows') || name.includes('shortest'))
    return { label: "Graphs & Trees", icon: GitBranch, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    
  if (name.includes('math') || name.includes('number') || name.includes('combinatorics') || name.includes('geometry') || name.includes('probabilities'))
    return { label: "Math & Logic", icon: Calculator, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" };
    
  if (name.includes('string') || name.includes('hash') || name.includes('regex') || name.includes('expression'))
    return { label: "Strings", icon: Terminal, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    
  if (name.includes('bitmask') || name.includes('binary') || name.includes('divide'))
    return { label: "Low Level", icon: Binary, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
    
  return { label: "General", icon: Hash, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" };
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
    const groups: Record<string, { label: string; icon: any; color: string; bg: string; border: string; tags: ProblemTag[] }> = {};
    
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
    <div className="space-y-6">
      {/* Search & Stats Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search topics (e.g. dynamic programming)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background/40 border-border/40 focus:border-primary/40 focus:ring-primary/10 rounded-2xl transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {selectedTags.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearTags}
            className="h-11 px-4 rounded-2xl border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-all whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear {selectedTags.length} Filters
          </Button>
        )}
      </div>

      {/* Grouped Tags Scroll Area */}
      <ScrollArea className="h-[400px] -mx-2 px-2">
        <div className="space-y-8 pb-6">
          {groupedTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="p-3 rounded-2xl bg-muted/50">
                <Search className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No topics found matching "{searchQuery}"</p>
            </div>
          ) : (
            groupedTags.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <group.icon className={cn("h-4 w-4", group.color)} />
                  <h4 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                    {group.label}
                  </h4>
                  <div className="h-px flex-1 bg-border/40 ml-2" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const isSelected = selectedTags.some(t => t.value === tag.value);
                    return (
                      <motion.button
                        key={tag.value}
                        onClick={() => onTagClick(tag)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-background/40 hover:bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                        )}
                      >
                        {tag.name}
                        {isSelected && (
                          <motion.div
                            layoutId={`active-dot-${tag.value}`}
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background shadow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          />
                        )}
                      </motion.button>
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







