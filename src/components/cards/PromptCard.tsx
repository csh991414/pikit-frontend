'use client';

import React, { useState } from 'react';
import { Bookmark, Copy } from 'lucide-react';
import { PromptListItem } from '@/types';
import Link from 'next/link';
import { promptApi } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';

interface PromptCardProps {
  prompt: PromptListItem;
  onCopyCountUpdate?: (id: number, count: number) => void;
}

const PromptCard = ({ prompt, onCopyCountUpdate }: PromptCardProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showToast = useToastStore((state) => state.show);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCopying) return;

    setIsCopying(true);
    try {
      const detail = await promptApi.detail(prompt.id);
      await navigator.clipboard.writeText(detail.promptText);
      showToast('프롬프트가 복사되었습니다!');

      const result = await promptApi.incrementCopy(prompt.id);
      onCopyCountUpdate?.(prompt.id, result.copyCount);
    } catch (err) {
      showToast('복사에 실패했습니다.', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const handleCardClick = () => {
    // Google Analytics (GA4) event tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'prompt_click', {
        prompt_id: prompt.id,
        prompt_title: prompt.title,
        prompt_model: prompt.aiModel,
      });
    }
  };

  return (
    <Link
      href={`/prompts/detail?id=${prompt.id}`}
      onClick={handleCardClick}
      className="group block transition-transform hover:-translate-y-1"
    >
      {/* Image Area */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-bg-200"
        style={{ borderRadius: 'var(--radius-4)' }}
      >
        <img
          src={prompt.afterImageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info Area */}
      <div className="mt-3">
        <h3 className="mb-2 truncate text-body-600 text-gr-100">
          {prompt.title}
        </h3>

        <div className="flex items-center justify-between">
          {/* Left: Copy & Bookmark counts */}
          <div className="flex items-center gap-3 text-caption text-gr-300">
            <span className="flex items-center gap-1">
              <Copy size={12} />
              {prompt.copyCount}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark
                size={12}
                fill={prompt.isBookmarked ? 'currentColor' : 'none'}
              />
              {prompt.bookmarkCount}
            </span>
          </div>

          {/* Right: "Copy Prompt" button */}
          <button
            onClick={handleCopy}
            disabled={isCopying}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center rounded-sm text-caption text-gr-300 transition-colors disabled:opacity-50"
            style={{
              border: '1px solid var(--color-line-100)',
              height: '30px',
              paddingLeft: '8px',
              paddingRight: '10px',
              paddingTop: '6px',
              paddingBottom: '6px',
              gap: '4px',
              backgroundColor: isHovered
                ? 'var(--color-bg-200)'
                : 'var(--color-bg-100)',
            }}
          >
            <Copy size={16} />
            <span>{isCopying ? '복사 중...' : '프롬프트 복사'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PromptCard;
