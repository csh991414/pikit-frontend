'use client';

import React from 'react';
import { PromptListItem } from '@/types';
import PromptCard from '../cards/PromptCard';
import PromptCardSkeleton from '../skeletons/PromptCardSkeleton';

interface AllPromptsSectionProps {
  prompts: PromptListItem[];
  isLoading: boolean;
  onCopyCountUpdate: (id: number, count: number) => void;
}

const AllPromptsSection = ({
  prompts,
  isLoading,
  onCopyCountUpdate,
}: AllPromptsSectionProps) => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <h2 className="mb-4 text-heading-md text-gr-100">전체 프롬프트</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-y-8">
          {[...Array(16)].map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-y-8">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopyCountUpdate={onCopyCountUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AllPromptsSection;
