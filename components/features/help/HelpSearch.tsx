"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  relevance: number;
}

const helpContent: SearchResult[] = [
  {
    id: "1",
    title: "How to start your first practice session",
    description: "Learn how to set up and begin a practice session with custom difficulty and tags.",
    category: "Training",
    tags: ["training", "beginner", "session", "setup"],
    relevance: 0.9,
  },
  {
    id: "2",
    title: "Understanding the notification system",
    description: "Learn about notifications, marking as read, and managing your notification center.",
    category: "Notifications",
    tags: ["notifications", "bell", "admin", "alerts"],
    relevance: 0.8,
  },
  {
    id: "3",
    title: "Syncing your Codeforces profile",
    description: "How to connect and sync your Codeforces account with CF Training Tracker.",
    category: "Account",
    tags: ["codeforces", "sync", "profile", "connection"],
    relevance: 0.9,
  },
  {
    id: "4",
    title: "Reading statistics and performance analytics",
    description: "Understand your progress charts, heatmaps, and performance metrics.",
    category: "Analytics",
    tags: ["statistics", "analytics", "charts", "performance"],
    relevance: 0.7,
  },
  {
    id: "5",
    title: "Managing upsolve problems",
    description: "Track and manage problems you need to upsolve from contests.",
    category: "Upsolve",
    tags: ["upsolve", "contests", "problems", "tracking"],
    relevance: 0.6,
  },
  {
    id: "6",
    title: "Changing your PIN and account settings",
    description: "How to update your PIN, change themes, and manage account preferences.",
    category: "Settings",
    tags: ["pin", "settings", "account", "security"],
    relevance: 0.8,
  },
  {
    id: "7",
    title: "Admin features and notification management",
    description: "How to use admin features to create and manage notifications for all users.",
    category: "Admin",
    tags: ["admin", "management", "notifications", "users"],
    relevance: 0.5,
  },
  {
    id: "8",
    title: "Troubleshooting login issues",
    description: "Common solutions for login problems and account access issues.",
    category: "Troubleshooting",
    tags: ["login", "troubleshooting", "access", "problems"],
    relevance: 0.7,
  },
];

interface HelpSearchProps {
  query: string;
}

export default function HelpSearch({ query }: HelpSearchProps) {
  const [resultsState, setResultsState] = useState<{ query: string; results: SearchResult[] }>({
    query: "",
    results: [],
  });

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const searchTimer = setTimeout(() => {
      const results = helpContent
        .filter((item) => {
          const searchTerm = query.toLowerCase();
          return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            item.category.toLowerCase().includes(searchTerm)
          );
        })
        .sort((a, b) => {
          const calculateScore = (item: SearchResult) => {
            const searchTerm = query.toLowerCase();
            let score = 0;

            if (item.title.toLowerCase().includes(searchTerm)) score += 3;
            if (item.category.toLowerCase().includes(searchTerm)) score += 2;
            if (item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) score += 1;

            return score;
          };

          return calculateScore(b) - calculateScore(a);
        })
        .slice(0, 8);

      setResultsState({ query, results });
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const searchResults = resultsState.query === query ? resultsState.results : [];
  const isLoading = query.trim() !== "" && resultsState.query !== query;

  if (!query.trim()) {
    return null;
  }

  return (
    <Card className="border border-emerald-500/20 bg-[#060a08] rounded-sm text-emerald-400 font-mono">
      <CardHeader className="border-b border-emerald-500/10 pb-4">
        <CardTitle className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Search className="size-4" />
          <span>{"Search Results"}</span>
          {searchResults.length > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-sm text-[8px] font-bold">
              {searchResults.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-[9px] uppercase text-emerald-500/40 font-bold">
          Results for &quot;{query}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4 text-[9px] uppercase">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-1">
                <div className="h-3 bg-emerald-500/10 rounded-sm w-3/4"></div>
                <div className="h-2.5 bg-emerald-500/5 rounded-sm w-1/2"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-3.5 border border-emerald-500/10 rounded-sm hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[11px] font-bold text-emerald-300 group-hover:text-emerald-400 transition-colors uppercase tracking-wide">
                      {result.title}
                    </h4>
                    <p className="text-[9px] text-emerald-500/60 leading-relaxed uppercase">
                      {result.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[8px] font-bold uppercase border border-emerald-500/15 bg-emerald-950/10 px-1.5 py-0.5 rounded-sm text-emerald-400">
                        {result.category}
                      </span>
                      {result.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[8px] font-bold uppercase bg-emerald-500/5 px-1.5 py-0.5 rounded-sm text-emerald-500/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ExternalLink className="size-3.5 text-emerald-500/30 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-emerald-500/40">
            <Search className="size-8 mx-auto mb-3 animate-pulse" />
            <h3 className="text-xs font-bold uppercase text-emerald-300">No results found</h3>
            <p className="text-[9px] uppercase mt-1">
              Try searching with different keywords or browse our help categories above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
