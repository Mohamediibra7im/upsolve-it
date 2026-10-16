"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    description:
      "Learn how to set up and begin a practice session with custom difficulty and tags.",
    category: "Training",
    tags: ["training", "beginner", "session", "setup"],
    relevance: 0.9,
  },
  {
    id: "2",
    title: "Understanding the notification system",
    description:
      "Learn about notifications, marking as read, and managing your notification center.",
    category: "Notifications",
    tags: ["notifications", "bell", "admin", "alerts"],
    relevance: 0.8,
  },
  {
    id: "3",
    title: "Syncing your Codeforces profile",
    description:
      "How to connect and sync your Codeforces account with Upsolve.it.",
    category: "Account",
    tags: ["codeforces", "sync", "profile", "connection"],
    relevance: 0.9,
  },
  {
    id: "4",
    title: "Reading statistics and performance analytics",
    description:
      "Understand your progress charts, heatmaps, and performance metrics.",
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
    title: "Changing your password and account settings",
    description: "How to update your password and manage account preferences.",
    category: "Settings",
    tags: ["password", "settings", "account", "security"],
    relevance: 0.8,
  },
  {
    id: "7",
    title: "Admin features and notification management",
    description:
      "How to use admin features to create and manage notifications for all users.",
    category: "Admin",
    tags: ["admin", "management", "notifications", "users"],
    relevance: 0.5,
  },
  {
    id: "8",
    title: "Troubleshooting login issues",
    description:
      "Common solutions for login problems and account access issues.",
    category: "Troubleshooting",
    tags: ["login", "troubleshooting", "access", "problems"],
    relevance: 0.7,
  },
];

interface HelpSearchProps {
  query: string;
}

export default function HelpSearch({ query }: HelpSearchProps) {
  const [resultsState, setResultsState] = useState<{
    query: string;
    results: SearchResult[];
  }>({
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
            item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
            item.category.toLowerCase().includes(searchTerm)
          );
        })
        .sort((a, b) => {
          const calculateScore = (item: SearchResult) => {
            const searchTerm = query.toLowerCase();
            let score = 0;

            if (item.title.toLowerCase().includes(searchTerm)) score += 3;
            if (item.category.toLowerCase().includes(searchTerm)) score += 2;
            if (item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
              score += 1;

            return score;
          };

          return calculateScore(b) - calculateScore(a);
        })
        .slice(0, 8);

      setResultsState({ query, results });
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const searchResults =
    resultsState.query === query ? resultsState.results : [];
  const isLoading = query.trim() !== "" && resultsState.query !== query;

  if (!query.trim()) {
    return null;
  }

  return (
    <Card className="border border-[#2b3031] bg-[#191c1e] rounded-2xl text-[#b5e3c4] font-sans">
      <CardHeader className="border-b border-[#2b3031] pb-4">
        <CardTitle className="flex items-center space-x-2 text-xs font-medium tracking-normal text-[#b5e3c4]">
          <Search className="size-4" />
          <span>Search results</span>
          {searchResults.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-[#b5e3c4]/10 text-[#b5e3c4] border border-[#2b3031] rounded-xl text-xs font-medium"
            >
              {searchResults.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs text-[#929b98] font-medium">
          Results for &quot;{query}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div role="status" className="space-y-4">
            <span className="sr-only">Searching help</span>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="motion-safe:animate-pulse space-y-1">
                <div className="h-3 bg-[#b5e3c4]/10 rounded-xl w-3/4"></div>
                <div className="h-2.5 bg-[#b5e3c4]/5 rounded-xl w-1/2"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((result) => (
              <Link
                href="/help/faq"
                key={result.id}
                className="block p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] border border-[#2b3031] rounded-xl hover:bg-[#b5e3c4]/5 hover:border-[#69746e] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-base font-medium text-[#f1f3ee] group-hover:text-[#b5e3c4] transition-colors tracking-normal">
                      {result.title}
                    </h4>
                    <p className="text-sm text-[#929b98] leading-7 ">
                      {result.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-medium border border-[#2b3031] bg-[#b5e3c4]/10 px-1.5 py-0.5 rounded-xl text-[#b5e3c4]">
                        {result.category}
                      </span>
                      {result.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium bg-[#b5e3c4]/5 px-1.5 py-0.5 rounded-xl text-[#929b98]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ExternalLink className="size-3.5 text-[#929b98] group-hover:text-[#b5e3c4] transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#929b98]">
            <Search className="size-8 mx-auto mb-3 motion-safe:animate-pulse" />
            <h3 className="text-lg font-medium text-[#b5e3c4]">
              No results found
            </h3>
            <p className="text-sm mt-2">
              Try a different keyword, or browse the guides below.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
