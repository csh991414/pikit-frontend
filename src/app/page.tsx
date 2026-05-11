'use client';

import React, { useState, useEffect } from 'react';
import { PromptCard } from '@/components/ui/PromptCard';
import { promptApi } from '@/lib/api';
import { PromptListItem, PromptSort } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<PromptSort>('latest');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const fetchPrompts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await promptApi.list({ sort });
        if (!cancelled) {
          setPrompts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : '프롬프트를 불러오지 못했습니다'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPrompts();
    return () => {
      cancelled = true;
    };
  }, [sort, accessToken]);

  const handleLikeChange = (promptId: number, liked: boolean, count: number) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId ? { ...p, isLiked: liked, likeCount: count } : p
      )
    );
  };

  const handleBookmarkChange = (
    promptId: number,
    bookmarked: boolean,
    count: number
  ) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId ? { ...p, isBookmarked: bookmarked, bookmarkCount: count } : p
      )
    );
  };

  const handleCopyChange = (promptId: number, copyCount: number) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? { ...p, copyCount } : p))
    );
  };

  return (
    <main className="container mx-auto max-w-[1400px] px-4 py-8">
      {/* Nav Area */}
      <nav className="mb-8 flex items-center gap-8 border-b border-line-100 pb-4">
        <button
          onClick={() => setSort('latest')}
          className={`font-mono text-sm transition-colors ${
            sort === 'latest' ? 'text-primary-100' : 'text-gray-400 hover:text-gray-100'
          }`}
        >
          {`// latest`}
        </button>
        <button
          onClick={() => setSort('popular')}
          className={`font-mono text-sm transition-colors ${
            sort === 'popular' ? 'text-primary-100' : 'text-gray-400 hover:text-gray-100'
          }`}
        >
          {`// popular`}
        </button>
      </nav>

      {/* Status Area */}
      <div className="mb-8 flex items-center gap-2 border-y border-line-100 py-3 font-mono text-xs text-gray-300">
        <span className="text-primary-100">●</span>
        <span>
          {isLoading ? 'loading prompts...' : `${prompts.length} prompts loaded`}
        </span>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="py-20 text-center font-mono text-red-400">
          <p>{error}</p>
          <button
            onClick={() => setSort(sort)}
            className="mt-4 text-sm underline hover:text-red-300"
          >
            retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] animate-pulse rounded-md border border-line-100 bg-bg-200"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && prompts.length === 0 && (
        <div className="py-20 text-center font-mono text-gray-400">
          No prompts found.
        </div>
      )}

      {/* Card Grid */}
      {!isLoading && !error && prompts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onLikeChange={handleLikeChange}
              onBookmarkChange={handleBookmarkChange}
              onCopyChange={handleCopyChange}
            />
          ))}
        </div>
      )}
    </main>
  );
}
