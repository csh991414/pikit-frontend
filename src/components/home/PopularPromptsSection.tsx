'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PromptCard from '@/components/cards/PromptCard';
import PromptCardSkeleton from '@/components/skeletons/PromptCardSkeleton';
import type { PromptListItem } from '@/types';

interface PopularPromptsSectionProps {
  prompts: PromptListItem[];
  isLoading: boolean;
}

const AUTO_SLIDE_INTERVAL = 5000;

// 화면 너비에 따라 보여줄 카드 수 반환
function getVisibleCount() {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 4;
}

export default function PopularPromptsSection({
  prompts,
  isLoading,
}: PopularPromptsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // visibleCount 초기화 및 resize 감지
  useEffect(() => {
    setVisibleCount(getVisibleCount());

    const handleResize = () => {
      setVisibleCount(getVisibleCount());
      setCurrentPage(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(prompts.length / visibleCount);

  // 자동 슬라이드
  useEffect(() => {
    if (isPaused || totalPages <= 1 || isLoading) return;

    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, totalPages, isLoading]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  if (!isLoading && prompts.length === 0) return null;

  const gridClass =
    visibleCount === 1
      ? 'grid-cols-1'
      : visibleCount === 2
      ? 'grid-cols-2'
      : 'grid-cols-4';

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-4 pt-8 md:px-6">
      <h2 className="mb-4 text-heading-md text-gr-100">인기 프롬프트</h2>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 카드 그리드 */}
        {isLoading ? (
          <div className={`grid ${gridClass} gap-4 md:gap-6`}>
            {[...Array(visibleCount)].map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const pagePrompts = prompts.slice(
                  pageIndex * visibleCount,
                  pageIndex * visibleCount + visibleCount,
                );

                return (
                  <div
                    key={pageIndex}
                    className={`grid w-full flex-shrink-0 ${gridClass} gap-4 md:gap-6`}
                  >
                    {pagePrompts.map((prompt) => (
                      <PromptCard key={prompt.id} prompt={prompt} />
                    ))}

                    {pagePrompts.length < visibleCount &&
                      Array.from({
                        length: visibleCount - pagePrompts.length,
                      }).map((_, i) => (
                        <div
                          key={`empty-${pageIndex}-${i}`}
                          className="invisible"
                        />
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 좌측 화살표 — 데스크탑 hover 시에만 표시 */}
        {!isLoading && totalPages > 1 && (
          <button
            onClick={handlePrev}
            className={`absolute left-0 top-[31%] z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-100 bg-bg-100 shadow-lg transition-all duration-300 hover:shadow-xl md:flex ${
              isPaused ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="이전 페이지"
          >
            <ChevronLeft size={20} className="text-gr-100" />
          </button>
        )}

        {/* 우측 화살표 — 데스크탑 hover 시에만 표시 */}
        {!isLoading && totalPages > 1 && (
          <button
            onClick={handleNext}
            className={`absolute right-0 top-[31%] z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-100 bg-bg-100 shadow-lg transition-all duration-300 hover:shadow-xl md:flex ${
              isPaused ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-label="다음 페이지"
          >
            <ChevronRight size={20} className="text-gr-100" />
          </button>
        )}

        {/* 페이지 인디케이터 (점) */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-gr-400 hover:bg-gr-300'
                }`}
                aria-label={`${index + 1}페이지로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
