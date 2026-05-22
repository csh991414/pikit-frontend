'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy as CopyIcon, Bookmark as BookmarkIcon } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { promptApi } from '@/lib/api';
import { PromptDetail } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useToastStore } from '@/stores/toastStore';
import PromptDetailSkeleton from '@/components/skeletons/PromptDetailSkeleton';
import Link from 'next/link';

function PromptDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const showToast = useToastStore((state) => state.show);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await promptApi.detail(Number(id));
        setPrompt(data);
        setIsBookmarked(data.isBookmarked);
      } catch (err) {
        console.error('Failed to fetch prompt detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleCopy = async () => {
    if (!prompt) return;
    const textToCopy = prompt.promptText || prompt.description || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('프롬프트가 복사되었습니다!');
      const result = await promptApi.incrementCopy(prompt.id);
      setPrompt((prev) =>
        prev ? { ...prev, copyCount: result.copyCount } : null,
      );
    } catch (err) {
      showToast('복사에 실패했습니다.', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!prompt) return;
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    // 1) 즉시 UI 토글 (낙관적 업데이트)
    const prevBookmarked = isBookmarked;
    const prevCount = prompt.bookmarkCount;
    
    setIsBookmarked(!prevBookmarked);
    setPrompt({
      ...prompt,
      bookmarkCount: prevBookmarked ? prevCount - 1 : prevCount + 1,
    });

    try {
      // 2) 백엔드 호출
      const result = await promptApi.toggleBookmark(prompt.id);
      
      // 3) 서버 응답으로 동기화
      setIsBookmarked(result.bookmarked ?? !prevBookmarked);
      setPrompt((prev) =>
        prev ? { ...prev, bookmarkCount: result.count } : null,
      );
      
      // 4) 토스트
      showToast(
        !prevBookmarked
          ? '북마크에 저장되었습니다.'
          : '북마크가 해제되었습니다.',
        'success'
      );
    } catch (err) {
      // 5) 실패 시 롤백
      setIsBookmarked(prevBookmarked);
      setPrompt((prev) =>
        prev ? { ...prev, bookmarkCount: prevCount } : null,
      );
      showToast('북마크 처리에 실패했습니다.', 'error');
    }
  };

  if (!id) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center md:px-6">
        <p className="text-heading-md text-gr-200 mb-4">잘못된 접근입니다</p>
        <Link href="/" className="text-primary underline text-body-500">
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  if (isLoading) return <PromptDetailSkeleton />;

  if (!prompt) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center md:px-6">
        <p className="text-heading-md text-gr-200 mb-4">
          프롬프트를 찾을 수 없습니다
        </p>
        <Link href="/" className="text-primary underline text-body-500">
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      {/* Top Info Area */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-heading-md md:text-heading-lg text-gr-100 mb-2">
          {prompt.title}
        </h1>
        <div className="flex items-center gap-3 text-caption-lg-400 text-gr-300">
          <span className="flex items-center" style={{ gap: '4px' }}>
            <CopyIcon size={16} /> {prompt.copyCount}
          </span>
          <span className="flex items-center" style={{ gap: '4px' }}>
            <BookmarkIcon
              size={16}
              fill={isBookmarked ? 'currentColor' : 'none'}
              className={isBookmarked ? 'text-primary' : ''}
            />{' '}
            {prompt.bookmarkCount}
          </span>
        </div>
      </div>

      {/* Main Content: 모바일 1열, 데스크탑 2열 */}
      <div className="grid grid-cols-1 gap-6 items-start md:grid-cols-2 md:gap-8">
        {/* Left: Before/After Slider Area */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-line-100 shadow-sm bg-bg-200">
            <BeforeAfterSlider
              beforeImageUrl={prompt.beforeImageUrl}
              afterImageUrl={prompt.afterImageUrl}
              className="w-full"
            />
          </div>
          <p className="text-caption-lg-400 text-gr-300 text-center mt-3">
            드래그해서 변환 결과 비교
          </p>
        </div>

        {/* Right: Prompt Text Area */}
        <div
          className="flex flex-col gap-3 border border-line-100 p-4"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          {/* Action Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-primary text-white py-3 rounded-md text-body-500 flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
            >
              <CopyIcon size={18} />
              프롬프트 복사
            </button>
            <button
              onClick={handleBookmark}
              className="p-3 bg-bg-100 border border-line-100 rounded-md hover:bg-bg-200 transition"
              aria-label="북마크"
            >
              <BookmarkIcon
                size={18}
                className={
                  isBookmarked ? 'fill-primary text-primary' : 'text-gr-200'
                }
              />
            </button>
          </div>

          {/* Prompt Text */}
          <div
            className="bg-bg-200 rounded-md border border-line-100"
            style={{ padding: '16px 20px' }}
          >
            <p className="text-heading-s text-gr-100 mb-2">프롬프트</p>
            <div className="text-body-400 text-gr-200 whitespace-pre-wrap leading-relaxed">
              {prompt.promptText || prompt.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromptDetailPage() {
  return (
    <Suspense fallback={<PromptDetailSkeleton />}>
      <PromptDetailContent />
    </Suspense>
  );
}
