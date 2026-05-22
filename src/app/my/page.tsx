'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import PromptCard from '@/components/cards/PromptCard';
import Pagination from '@/components/common/Pagination';
import { promptApi } from '@/lib/api';
import { PageResponse, PromptListItem } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [data, setData] = useState<PageResponse<PromptListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // 비로그인 시 홈으로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        // API는 0-based page를 사용하므로 page - 1
        const result = await promptApi.getMyBookmarks(page - 1, pageSize);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, page]);

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      {/* 내 정보 섹션 */}
      <section className="mb-10">
        <h1 className="text-heading-lg text-gr-100 mb-6">마이페이지</h1>
        <div className="bg-bg-200 rounded-2xl p-6 flex items-center gap-4 border border-line-100">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-primary text-heading-md">
            {user?.nickname?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-heading-md text-gr-100">{user?.nickname}</p>
            <p className="text-body-400 text-gr-300">{user?.username}</p>
          </div>
        </div>
      </section>

      {/* 북마크 목록 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-md text-gr-100">내가 북마크한 프롬프트</h2>
          {data && (
            <span className="text-caption-lg-400 text-gr-300">
              총 {data.totalElements ?? 0}개
            </span>
          )}
        </div>

        {loading && (
          <div className="py-20 text-center text-gr-300">불러오는 중...</div>
        )}

        {!loading && data && data.content?.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-heading-md text-gr-200 mb-2">아직 북마크한 프롬프트가 없습니다</p>
            <p className="text-body-400 text-gr-300 mb-8">
              마음에 드는 프롬프트의 책갈피 아이콘을 눌러 저장해보세요
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-white px-8 py-3 rounded-md text-body-500 hover:opacity-90 transition shadow-sm"
            >
              프롬프트 둘러보기
            </button>
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
      </section>
    </div>
  );
}
