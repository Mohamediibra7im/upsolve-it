"use client";

import { ProblemTag } from "@/types/Codeforces";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Hash,
  Binary,
  GitBranch,
  Calculator,
  TextCursorInput,
  Zap,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const getTagCategory = (tagName: string): { label: string; icon: LucideIcon } => {
  const name = tagName.toLowerCase();

  if (["dp", "greedy", "implementation", "constructive", "sort", "search"].some((term) => name.includes(term))) {
    return { label: "Algorithms", icon: Zap };
  }
  if (["graph", "tree", "dsu", "flows", "shortest"].some((term) => name.includes(term))) {
    return { label: "Graphs & trees", icon: GitBranch };
  }
  if (["math", "number", "combinatorics", "geometry", "probabilities"].some((term) => name.includes(term))) {
    return { label: "Math & logic", icon: Calculator };
  }
  if (["string", "hash", "regex", "expression"].some((term) => name.includes(term))) {
    return { label: "Strings", icon: TextCursorInput };
  }
  if (["bitmask", "binary", "divide"].some((term) => name.includes(term))) {
    return { label: "Low level", icon: Binary };
  }
  return { label: "General", icon: Hash };
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
    return allTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allTags, searchQuery]);

  const groupedTags = useMemo(() => {
    const groups: Record<string, { label: string; icon: LucideIcon; tags: ProblemTag[] }> = {};

    filteredTags.forEach((tag) => {
      const category = getTagCategory(tag.name);
      if (!groups[category.label]) groups[category.label] = { ...category, tags: [] };
      groups[category.label].tags.push(tag);
    });

    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredTags]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#929b98]" aria-hidden="true" />
        <Input
          aria-label="Search topics"
          placeholder="Search topics, like graphs or dp"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-11 rounded-xl border-[#2b3031] bg-[#15181a] pl-10 text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus-visible:ring-[#b5e3c4] focus-visible:ring-offset-[#191c1e]"
        />
      </div>

      <div className="flex min-h-6 items-center justify-between gap-3 text-xs">
        <p className="text-[#929b98]" aria-live="polite">
          {selectedTags.length ? `${selectedTags.length} ${selectedTags.length === 1 ? "topic" : "topics"} selected` : "All topics included"}
        </p>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClearTags}
            className="rounded-md px-1 py-1 text-[#b5e3c4] transition-colors hover:text-[#d2eedb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
          >
            Clear selection
          </button>
        )}
      </div>

      <ScrollArea className="h-[290px] pr-3">
        <div className="space-y-6 pb-3">
          {groupedTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-[#2b3031] px-5 py-12 text-center text-[#929b98]">
              <Search className="size-5" aria-hidden="true" />
              <p className="text-sm">No topics match “{searchQuery}”.</p>
              <button type="button" onClick={() => setSearchQuery("")} className="rounded-md px-2 py-1 text-xs text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]">
                Clear search
              </button>
            </div>
          ) : (
            groupedTags.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-2 text-[#929b98]">
                  <group.icon className="size-3.5" aria-hidden="true" />
                  <h4 className="text-xs font-medium">{group.label}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const isSelected = selectedTags.some((selectedTag) => selectedTag.value === tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onTagClick(tag)}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191c1e]",
                          isSelected
                            ? "border-[#b5e3c4]/50 bg-[#b5e3c4]/10 text-[#b5e3c4]"
                            : "border-[#2b3031] bg-[#15181a] text-[#b8c0bb] hover:border-[#69746e] hover:text-[#f1f3ee]",
                        )}
                      >
                        {isSelected && <Check className="size-3" aria-hidden="true" />}
                        {tag.name}
                      </button>
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
