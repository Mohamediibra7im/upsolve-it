"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { ProblemTag } from "@/types/Codeforces";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** The chosen topics as chips you can remove, and a dialog with every topic. */
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
  const opener = useRef<HTMLButtonElement>(null);
  const query = searchQuery.trim().toLowerCase();
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query) || tag.value.includes(query),
  );
  const selectedCount = selectedTags.length;

  return (
    <Dialog>
      <div
        role="group"
        aria-label="Selected topics"
        className="flex flex-wrap items-center gap-2"
      >
        {selectedCount === 0 && (
          <span className="t-sm t-muted">All topics included</span>
        )}
        {selectedTags.map((tag) => (
          <button
            key={tag.value}
            type="button"
            className="u-chip"
            aria-pressed="true"
            onClick={() => {
              onTagClick(tag);
              opener.current?.focus();
            }}
          >
            {tag.name}
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ))}
        <DialogTrigger ref={opener} className="u-btn u-btn--sm">
          <Plus aria-hidden="true" />
          Topics
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your focus</DialogTitle>
          <DialogDescription className="t-muted">
            Optional. Choose the topics for your set, or leave them all in.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="search"
          aria-label="Search topics"
          placeholder="Search topics, like graphs or dp"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {filteredTags.length === 0 ? (
          <p className="t-muted flex flex-wrap items-center gap-3">
            No topics match “{searchQuery}”.
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="u-btn u-btn--sm"
            >
              Clear search
            </button>
          </p>
        ) : (
          <div
            role="group"
            aria-label="Topics"
            className="flex flex-wrap gap-2"
          >
            {filteredTags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                className="u-chip"
                aria-pressed={selectedTags.some((t) => t.value === tag.value)}
                onClick={() => onTagClick(tag)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="t-sm t-muted" aria-live="polite">
            {selectedCount > 0 ? (
              <>
                <span className="t-num">{selectedCount}</span>{" "}
                {selectedCount === 1 ? "topic" : "topics"} selected
              </>
            ) : (
              "All topics included"
            )}
          </span>
          <span className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClearTags}
              disabled={selectedCount === 0}
              className="u-btn u-btn--sm"
            >
              Clear selection
            </button>
            <DialogClose className="u-btn u-btn--sm">Done</DialogClose>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagSelector;
