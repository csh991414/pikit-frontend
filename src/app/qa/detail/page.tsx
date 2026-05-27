'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, MessageCircle, ChevronLeft } from 'lucide-react';
import { questionApi, commentApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useToastStore } from '@/stores/toastStore';
import { QuestionResponse, CommentResponse, PageResponse } from '@/types';

function formatRelativeTime(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return new Date(dateString).toLocaleDateString('ko-KR');
}

function QuestionDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const { isAuthenticated, isAdmin } = useAuthStore();
    const { openLoginModal } = useUIStore();
    const showToast = useToastStore((state) => state.show);

    const [question, setQuestion] = useState<QuestionResponse | null>(null);
    const [comments, setComments] = useState<PageResponse<CommentResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);

    const canDeleteQuestion = question && (question.isAuthor || isAdmin);

    const loadAll = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [q, c] = await Promise.all([
                questionApi.getOne(Number(id)),
                commentApi.getList(Number(id), 0, 100), // 상세 페이지니까 넉넉하게 100개
            ]);
            setQuestion(q);
            setComments(c);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, [id]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        if (!isAuthenticated) {
            openLoginModal();
            return;
        }
        setSubmitting(true);
        try {
            await commentApi.create(Number(id), newComment.trim());
            setNewComment('');
            showToast('댓글이 등록되었습니다.');
            // 새로고침 (질문의 commentCount도 갱신해야 하므로 둘 다 호출)
            const [q, c] = await Promise.all([
                questionApi.getOne(Number(id)),
                commentApi.getList(Number(id), 0, 100),
            ]);
            setQuestion(q);
            setComments(c);
        } catch {
            showToast('댓글 등록에 실패했습니다.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentDelete = async (commentId: number) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await commentApi.delete(commentId);
            showToast('댓글이 삭제되었습니다.');
            loadAll();
        } catch {
            showToast('댓글 삭제에 실패했습니다.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm('이 질문을 삭제하시겠습니까?')) return;
        try {
            await questionApi.delete(Number(id));
            showToast('질문이 삭제되었습니다.');
            router.push('/qa');
        } catch {
            showToast('삭제에 실패했습니다.', 'error');
        }
    };

    if (!id) {
        return (
            <div className="mx-auto max-w-[1280px] px-6 py-20 text-center">
                <p className="text-heading-md text-gr-200">잘못된 접근입니다</p>
                <button onClick={() => router.push('/qa')} className="mt-4 text-primary hover:underline">목록으로 돌아가기</button>
            </div>
        );
    }

    if (loading) {
        return <div className="py-20 text-center text-gr-300">불러오는 중...</div>;
    }

    if (error || !question) {
        return (
            <div className="mx-auto max-w-[1280px] px-6 py-20 text-center">
                <p className="text-heading-md text-gr-200 mb-4">질문을 찾을 수 없습니다</p>
                <button
                    onClick={() => router.push('/qa')}
                    className="text-primary hover:underline"
                >
                    질문 목록으로
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1280px] px-6 py-6">
            <button 
                onClick={() => router.push('/qa')}
                className="flex items-center gap-1 text-gr-300 mb-6 hover:text-gr-200 transition"
            >
                <ChevronLeft size={20} />
                <span>목록으로</span>
            </button>

            {/* 상단 2단 레이아웃 (반응형: 모바일은 세로, 데스크탑은 가로) */}
            <div className="flex flex-col lg:flex-row gap-10 mt-4 mb-12 pb-12 border-b border-line-100">
                {/* 좌측: 이미지 영역 */}
                <div className="w-full lg:w-[55%] shrink-0">
                    <div className="aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-bg-200 shadow-sm border border-line-100">
                        {question.imageUrl ? (
                            <img 
                                src={question.imageUrl} 
                                alt={question.title} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gr-300">
                                <MessageCircle size={64} className="opacity-20" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 우측: 질문 정보 및 본문 */}
                <div className="w-full lg:w-[45%] flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <h1 className="text-heading-md sm:text-heading-lg text-gr-100 break-words leading-tight">
                            {question.title}
                        </h1>
                        {canDeleteQuestion && (
                            <button
                                onClick={handleDelete}
                                className="text-body-400 text-gr-300 hover:text-danger transition shrink-0 mt-1"
                            >
                                삭제
                            </button>
                        )}
                    </div>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-body-400 text-gr-300 mb-8 pb-6 border-b border-line-100">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-caption-400 text-primary font-bold">
                                {question.authorNickname?.charAt(0)}
                            </div>
                            <span className="text-gr-200 font-medium">{question.authorNickname}</span>
                        </div>
                        <span className="text-gr-400 hidden sm:inline">|</span>
                        <span>{formatRelativeTime(question.createdAt)}</span>
                        <span className="text-gr-400 hidden sm:inline">|</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye size={16} /> {question.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle size={16} /> {question.commentCount}
                            </span>
                        </div>
                    </div>

                    {/* 본문 영역 */}
                    <div className="bg-bg-100 rounded-xl p-6 flex-1 min-h-[200px] lg:min-h-0">
                        <p className="text-body-lg-400 text-gr-100 whitespace-pre-wrap leading-relaxed">
                            {question.content}
                        </p>
                    </div>
                </div>
            </div>

            {/* 댓글 영역 (하단 전체 폭) */}
            <section>
                <h2 className="text-heading-sm text-gr-100 mb-6">
                    댓글 {comments?.totalElements ?? 0}개
                </h2>

                {/* 댓글 작성 */}
                <div className="mb-6">
                    {isAuthenticated ? (
                        <div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요"
                                rows={3}
                                className="w-full border border-line-100 rounded-lg px-4 py-3 text-body-400 focus:outline-none focus:border-primary resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={!newComment.trim() || submitting}
                                    className="bg-primary text-white px-5 py-2 rounded-lg text-body-500 hover:opacity-90 disabled:opacity-50 transition"
                                >
                                    {submitting ? '등록 중...' : '댓글 등록'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-line-100 rounded-lg p-4 text-center text-body-400 text-gr-300 bg-bg-100">
                            댓글을 작성하려면{' '}
                            <button onClick={openLoginModal} className="text-primary hover:underline font-medium">
                                로그인
                            </button>
                            이 필요합니다
                        </div>
                    )}
                </div>

                {/* 댓글 목록 */}
                {comments?.content?.length === 0 ? (
                    <p className="py-10 text-center text-body-400 text-gr-300">
                        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {comments?.content?.map((c) => (
                            <li key={c.id} className="border-b border-line-100 pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-caption-400 text-primary">
                                            {c.authorNickname?.charAt(0)}
                                        </div>
                                        <span className="text-body-500 text-gr-100">{c.authorNickname}</span>
                                        <span className="text-caption-lg-400 text-gr-300">
                                            {formatRelativeTime(c.createdAt)}
                                        </span>
                                    </div>
                                    {(c.isAuthor || isAdmin) && (
                                        <button
                                            onClick={() => handleCommentDelete(c.id)}
                                            className="text-caption-lg-400 text-gr-300 hover:text-danger transition"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                                <p className="text-body-400 text-gr-100 whitespace-pre-wrap pl-8">
                                    {c.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default function QuestionDetailPage() {
    return (
        <Suspense fallback={<div className="py-20 text-center text-gr-300">불러오는 중...</div>}>
            <QuestionDetailContent />
        </Suspense>
    );
}
