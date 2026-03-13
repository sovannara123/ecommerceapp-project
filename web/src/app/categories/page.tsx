"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/shared/ui/feedback/ErrorMessage";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

interface Category {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      setCategories(await res.json());
    } catch (e) {
      const message =
          e instanceof Error ? e.message : "Failed to load categories";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Categories</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="space-y-4">
          <ErrorMessage message={error} />
          <button
            onClick={() => void fetchCategories()}
            className="rounded-lg border border-[rgb(var(--color-border))] px-4 py-2 text-sm transition-colors hover:bg-[rgb(var(--color-bg-tertiary))]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="group flex flex-col items-center justify-center rounded-xl border border-[rgb(var(--color-border))] p-6 transition-all duration-200 hover:border-[rgb(var(--color-accent))] hover:shadow-md"
          >
            <span className="mb-3 text-4xl transition-transform group-hover:scale-110">
              {cat.icon}
            </span>
            <span className="text-center text-sm font-medium">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
