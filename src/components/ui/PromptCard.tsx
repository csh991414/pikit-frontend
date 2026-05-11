'use client';

import React, { useState } from 'react';
import { PromptListItem } from '@/types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Button } from './Button';
import { Clipboard, Check, Heart, Bookmark, Copy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { promptApi } from '@/lib/api';

interface Props {
  prompt: PromptListItem;
  onLikeChange?: (id: number, liked: boolean, count: number) => void;
  onBookmarkChange?: (id: number, bookmarked: boolean, count: number) => void;
  onCopyChange?: (id: number, copyCount: number) => void;
}

export const PromptCard: React.FC<Props> = ({
  prompt,
  onLikeChange,
  onBookmarkChange,
  onCopyChange,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const result = await promptApi.toggleLike(prompt.id);
      onLikeChange?.(prompt.id, result.liked ?? false, result.count);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const result = await promptApi.toggleBookmark(prompt.id);
      onBookmarkChange?.(prompt.id, result.bookmarked ?? false, result.count);
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (copyErr) {
        console.error('Failed to copy text: ', copyErr);
        document.body.removeChild(textarea);
        return false;
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCopying) return;

    setIsCopying(true);
    try {
      const detail = await promptApi.detail(prompt.id);
      const success = await copyToClipboard(detail.promptText);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        const result = await promptApi.incrementCopy(prompt.id);
        onCopyChange?.(prompt.id, result.copyCount);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-md border border-line-100 bg-bg-200 transition-colors hover:border-line-200">
      <BeforeAfterSlider
        beforeImageUrl={prompt.beforeImageUrl}
        afterImageUrl={prompt.afterImageUrl}
      />

      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-100 line-clamp-1">
            {prompt.title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-1">
            {prompt.description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-line-100 pt-4">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 font-mono text-sm transition-colors"
            >
              <Heart
                size={18}
                fill={prompt.isLiked ? 'currentColor' : 'none'}
                className={
                  prompt.isLiked
                    ? 'text-primary-100'
                    : 'text-gray-400 hover:text-gray-100'
                }
              />
              <span
                className={prompt.isLiked ? 'text-primary-100' : 'text-gray-400'}
              >
                {prompt.likeCount}
              </span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1 font-mono text-sm transition-colors"
            >
              <Bookmark
                size={18}
                fill={prompt.isBookmarked ? 'currentColor' : 'none'}
                className={
                  prompt.isBookmarked
                    ? 'text-primary-100'
                    : 'text-gray-400 hover:text-gray-100'
                }
              />
              <span
                className={
                  prompt.isBookmarked ? 'text-primary-100' : 'text-gray-400'
                }
              >
                {prompt.bookmarkCount}
              </span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="flex items-center gap-1 font-mono text-sm text-gray-400 transition-colors hover:text-primary-100 disabled:opacity-50"
            >
              {copied ? (
                <Check size={18} className="text-primary-100" />
              ) : (
                <Copy size={18} />
              )}
              <span className={copied ? 'text-primary-100' : ''}>
                {prompt.copyCount}
              </span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-gray-500">
            by {prompt.author.nickname}
          </div>
        </div>
      </div>
    </div>
  );
};
