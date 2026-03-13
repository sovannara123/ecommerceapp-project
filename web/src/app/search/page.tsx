"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

type SearchResult = {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const stored = window.localStorage.getItem("recent_searches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setRecentSearches(parsed);
      } catch {
        window.localStorage.removeItem("recent_searches");
      }
    }
  }, []);

  const saveRecent = (value: string) => {
    const next = [value, ...recentSearches.filter((item) => item !== value)].slice(
      0,
      10
    );
    setRecentSearches(next);
    window.localStorage.setItem("recent_searches", JSON.stringify(next));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      saveRecent(query.trim());

      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }
        setResults((await res.json()) as SearchResult[]);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to fetch search results";
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="relative mb-6">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="h-12 w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-secondary))] pl-12 pr-4 text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
        />
        <svg
          className="absolute left-4 top-3.5 h-5 w-5 text-[rgb(var(--color-text-tertiary))]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {!query.trim() && recentSearches.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Recent searches</h1>
            <button
              onClick={() => {
                setRecentSearches([]);
                window.localStorage.removeItem("recent_searches");
              }}
              className="text-sm text-[rgb(var(--color-accent))]"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="block w-full rounded-lg border border-[rgb(var(--color-border))] px-4 py-3 text-left transition-colors hover:bg-[rgb(var(--color-bg-secondary))]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Search failed" description={error} />
      ) : results.length === 0 && query.trim() ? (
        <EmptyState
          title="No results found"
          description={`We couldn't find anything for "${query}"`}
        />
      ) : (
        <div className="space-y-3">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="flex w-full items-center gap-4 rounded-lg border border-[rgb(var(--color-border))] p-4 text-left transition-colors hover:bg-[rgb(var(--color-bg-secondary))]"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : null}
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  ${product.price?.toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
