'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { questionApi } from '@/lib/api';
import QuestionCreateModal from '@/components/qa/QuestionCreateModal';
import Pagination from '@/components/common/Pagination';
import { PageResponse, QuestionResponse } from '@/types';

export default function QaPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { openLoginModal } = useUIStore();
    const [data, setData] = useState<PageResponse<QuestionResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const loadList = () => {
        setLoading(true);
        questionApi.getList(page, 12)
            .then(setData)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadList(); }, [page]);

    const handleCreateClick = () => {
        if (!isAuthenticated) {
            openLoginModal();
            return;
        }
        setCreateModalOpen(true);
    };

    const formatRelativeTime = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return '방금';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    return (
        <div className="mx-auto max-w-[1280px] px-6 py-8">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-heading-lg text-gr-100">질문해요</h1>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-body-500 hover:opacity-90 transition"
                >
                    <Plus size={16} />
                    질문 등록
                </button>
            </div>

            {/* 로딩 */}
            {loading && !data && (
                <div className="py-20 text-center text-gr-300">불러오는 중...</div>
            )}

            {/* 빈 상태 */}
            {!loading && data?.content?.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-heading-md text-gr-200 mb-2">아직 등록된 질문이 없습니다</p>
                    <p className="text-body-400 text-gr-300">첫 번째 질문을 등록해보세요!</p>
                </div>
            )}

            {/* 카드 그리드 */}
            {data && data.content.length > 0 && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {data.content.map((q) => (
                            <article
                                key={q.id}
                                className="cursor-pointer group"
                                onClick={() => {
                                    router.push(`/qa/detail?id=${q.id}`);
                                }}
                            >
                                {/* 이미지 (없으면 placeholder) */}
                                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-bg-200 mb-3">
                                    {q.imageUrl ? (
                                        <img
                                            src={q.imageUrl}
                                            alt={q.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gr-300">
                                            <MessageCircle size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* 제목 */}
                                <h3 className="text-body-500 text-gr-100 mb-2 line-clamp-1">
                                    {q.title}
                                </h3>

                                {/* 메타 정보 */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-caption-lg-400 text-gr-300">
                                        <span>{formatRelativeTime(q.createdAt)}</span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} /> {q.viewCount ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={12} /> {q.commentCount ?? 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-caption-lg-400 text-gr-200">{q.authorNickname}</span>
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {q.authorNickname?.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* 페이지네이션 */}
                    <div className="mt-10">
                        <Pagination 
                            currentPage={page + 1} 
                            totalPages={data.totalPages} 
                            onPageChange={(p) => setPage(p - 1)} 
                        />
                    </div>
                </>
            )}

            {/* 등록 모달 */}
            {createModalOpen && (
                <QuestionCreateModal
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={() => {
                        setCreateModalOpen(false);
                        setPage(0);
                        loadList();
                    }}
                />
            )}
        </div>
    );
}
