'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { questionApi, uploadApi } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export default function QuestionCreateModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { show: showToast } = useToastStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sizeErrorOpen, setSizeErrorOpen] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE) {
            setSizeErrorOpen(true);
            e.target.value = '';
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            showToast('이미지 파일만 업로드 가능합니다.', 'error');
            e.target.value = '';
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadApi.uploadImage(formData);
            setImageUrl(result.url);
            showToast('이미지가 업로드되었습니다.');
        } catch (err: any) {
            showToast(err.message || '이미지 업로드에 실패했습니다.', 'error');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) return showToast('제목을 입력해주세요.', 'error');
        if (!content.trim()) return showToast('내용을 입력해주세요.', 'error');

        setSubmitting(true);
        try {
            await questionApi.create({
                title: title.trim(),
                content: content.trim(),
                imageUrl: imageUrl || undefined,
            });
            showToast('질문이 등록되었습니다.');
            onSuccess();
        } catch (err: any) {
            showToast(err.message || '질문 등록에 실패했습니다.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl w-[520px] max-w-[90vw] max-h-[90vh] overflow-y-auto p-6 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-heading-md text-gr-100">질문 등록</h2>
                        <button onClick={onClose} className="text-gr-300 hover:text-gr-100">
                            <X size={20} />
                        </button>
                    </div>

                    {/* 제목 */}
                    <div className="mb-4">
                        <label className="text-caption-lg-500 text-gr-100 block mb-2">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="질문 제목을 입력하세요"
                            maxLength={200}
                            className="w-full border border-line-100 rounded-lg px-4 py-2.5 text-body-400 focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* 이미지 (선택) */}
                    <div className="mb-4">
                        <label className="text-caption-lg-500 text-gr-100 block mb-2">이미지 (선택)</label>
                        <div className="border border-line-100 rounded-lg p-3">
                            {imageUrl ? (
                                <div className="relative">
                                    <img src={imageUrl} alt="첨부 이미지" className="w-full h-40 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl('')}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-40 cursor-pointer text-gr-300 hover:text-primary transition">
                                    {uploading ? (
                                        <span className="text-caption-lg-400">업로드 중...</span>
                                    ) : (
                                        <>
                                            <Upload size={24} />
                                            <span className="text-caption-lg-400 mt-2">파일 선택 (최대 10MB)</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 내용 */}
                    <div className="mb-5">
                        <label className="text-caption-lg-500 text-gr-100 block mb-2">내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="질문 내용을 자세히 적어주세요"
                            rows={6}
                            className="w-full border border-line-100 rounded-lg px-4 py-2.5 text-body-400 focus:outline-none focus:border-primary resize-none"
                        />
                    </div>

                    {/* 버튼 */}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-body-500 text-gr-200 hover:text-gr-100"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-primary text-white px-6 py-2 rounded-lg text-body-500 hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 용량 초과 모달 */}
            {sizeErrorOpen && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
                    onClick={() => setSizeErrorOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-[360px] max-w-[90vw] p-6 text-center shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-heading-md text-gr-100 mb-2">파일이 너무 큽니다</p>
                        <p className="text-body-400 text-gr-300 mb-6">
                            이미지 한 장당 최대 10MB까지<br />업로드할 수 있습니다.
                        </p>
                        <button
                            onClick={() => setSizeErrorOpen(false)}
                            className="bg-primary text-white px-6 py-2 rounded-lg text-body-500 hover:opacity-90"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
