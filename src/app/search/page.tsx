'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { promptApi } from '@/lib/api';
import PromptCard from '@/components/cards/PromptCard';
import Pagination from '@/components/common/Pagination';
import { PageResponse, PromptListItem } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [data, setData] = useState<PageResponse<PromptListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 16;

  useEffect(() => {
    // 검색어가 바뀌면 페이지를 1로 리셋
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!q.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // API는 0-based page를 기대하므로 page - 1
    promptApi.search(q, page - 1, pageSize)
      .then(setData)
      .catch((err) => {
        console.error('Search failed:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [q, page]);

  if (!q.trim()) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center">
        <p className="text-heading-md text-gr-200">검색어를 입력해주세요</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
      <h1 className="text-heading-lg text-gr-100 mb-6">
        &apos;<span className="text-primary">{q}</span>&apos; 검색 결과
        {data && (
          <span className="text-body-400 text-gr-300 ml-3 font-normal">
            {data.totalElements ?? 0}개
          </span>
        )}
      </h1>

      {loading && (
        <div className="py-20 text-center text-gr-300">불러오는 중...</div>
      )}

      {!loading && data && data.content?.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-heading-md text-gr-200 mb-2">검색 결과가 없습니다</p>
          <p className="text-body-400 text-gr-300">다른 검색어로 시도해보세요</p>
        </div>
      )}

      {!loading && data && data.content?.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.content.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
          
          <div className="mt-8">
            <Pagination 
              currentPage={page} 
              totalPages={data.totalPages} 
              onPageChange={setPage} 
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center text-gr-300">
        불러오는 중...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
