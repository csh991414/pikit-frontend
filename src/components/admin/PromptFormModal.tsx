'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';
import { PromptAdminItem } from '@/types';

interface PromptFormModalProps {
  mode: 'create' | 'edit';
  initialData?: PromptAdminItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_SIZE = 2.5 * 1024 * 1024; // 2.5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export default function PromptFormModal({ mode, initialData, onClose, onSuccess }: PromptFormModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [beforeImageUrl, setBeforeImageUrl] = useState(initialData?.beforeImageUrl ?? '');
  const [afterImageUrl, setAfterImageUrl] = useState(initialData?.afterImageUrl ?? '');
  const [promptText, setPromptText] = useState(initialData?.promptText ?? '');
  const [visible, setVisible] = useState(initialData?.visible ?? true);
  
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [sizeErrorModal, setSizeErrorModal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 검증
    if (file.size > MAX_SIZE) {
      setSizeErrorModal(true);
      e.target.value = '';
      return;
    }

    // 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('이미지 파일만 업로드 가능합니다. (jpg, png, webp, gif)', 'error');
      e.target.value = '';
      return;
    }

    const setUploading = target === 'before' ? setUploadingBefore : setUploadingAfter;
    const setUrl = target === 'before' ? setBeforeImageUrl : setAfterImageUrl;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await adminApi.uploadImage(formData);
      setUrl(result.url);
      showToast('이미지가 업로드되었습니다.');
    } catch (err) {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }
    if (!beforeImageUrl || !afterImageUrl) {
      showToast('전/후 이미지를 모두 업로드해주세요.', 'error');
      return;
    }
    if (!promptText.trim()) {
      showToast('프롬프트를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { title, beforeImageUrl, afterImageUrl, promptText, visible };
      if (mode === 'create') {
        await adminApi.createPrompt(payload);
        showToast('프롬프트가 등록되었습니다.');
      } else {
        await adminApi.updatePrompt(initialData!.id, payload);
        showToast('프롬프트가 수정되었습니다.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast('처리에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-bg-100 rounded-2xl w-[480px] max-w-[90vw] p-8 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-md text-gr-100">
              {mode === 'create' ? '프롬프트 등록' : '프롬프트 수정'}
            </h2>
            <button onClick={onClose} aria-label="닫기">
              <X size={20} className="text-gr-300 hover:text-gr-100" />
            </button>
          </div>

          {/* 제목 */}
          <div className="mb-4">
            <label className="text-caption-lg-500 text-gr-100 block mb-2">프롬프트 제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
              className="w-full border border-line-100 rounded-lg px-4 py-3 text-body-400 outline-none focus:border-primary bg-bg-100"
            />
          </div>

          {/* 이미지 업로드 (전/후) */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 전 이미지 */}
            <div>
              <label className="text-caption-lg-500 text-gr-100 block mb-2">전 이미지</label>
              <div className="border border-line-100 rounded-lg p-3">
                {beforeImageUrl ? (
                  <div className="relative">
                    <img
                      src={beforeImageUrl}
                      alt="전 이미지 미리보기"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setBeforeImageUrl('')}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                      aria-label="이미지 제거"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center h-32 cursor-pointer text-gr-300 hover:text-primary transition ${uploadingBefore ? 'pointer-events-none' : ''}`}>
                    {uploadingBefore ? (
                      <span className="text-caption-lg-400">업로드 중...</span>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span className="text-caption-lg-400 mt-2">파일 선택</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'before')}
                      disabled={uploadingBefore}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 후 이미지 */}
            <div>
              <label className="text-caption-lg-500 text-gr-100 block mb-2">후 이미지</label>
              <div className="border border-line-100 rounded-lg p-3">
                {afterImageUrl ? (
                  <div className="relative">
                    <img
                      src={afterImageUrl}
                      alt="후 이미지 미리보기"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setAfterImageUrl('')}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                      aria-label="이미지 제거"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center h-32 cursor-pointer text-gr-300 hover:text-primary transition ${uploadingAfter ? 'pointer-events-none' : ''}`}>
                    {uploadingAfter ? (
                      <span className="text-caption-lg-400">업로드 중...</span>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span className="text-caption-lg-400 mt-2">파일 선택</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'after')}
                      disabled={uploadingAfter}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 프롬프트 텍스트 */}
          <div className="mb-4">
            <label className="text-caption-lg-500 text-gr-100 block mb-2">프롬프트</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="프롬프트를 입력해주세요."
              rows={4}
              className="w-full border border-line-100 rounded-lg px-4 py-3 text-body-400 outline-none focus:border-primary resize-none bg-bg-100"
            />
          </div>

          {/* 노출 여부 토글 */}
          <div className="mb-6">
            <label className="text-caption-lg-500 text-gr-100 block mb-2">노출 여부</label>
            <button
              onClick={() => setVisible(!visible)}
              className={`relative w-11 h-6 rounded-full transition-colors ${visible ? 'bg-primary' : 'bg-gr-400'}`}
              aria-label="노출 여부 토글"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${visible ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="text-body-500 text-gr-200 px-4 py-2 hover:text-gr-100">
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || uploadingBefore || uploadingAfter}
              className="bg-primary text-white px-5 py-2 rounded-lg text-body-500 hover:opacity-90 disabled:opacity-50"
            >
              {mode === 'create' ? '등록' : '수정'}
            </button>
          </div>
        </div>
      </div>

      {/* 용량 초과 모달 */}
      {sizeErrorModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSizeErrorModal(false)}
        >
          <div
            className="bg-bg-100 rounded-2xl w-[360px] max-w-[90vw] p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-heading-md text-gr-100 mb-2">파일이 너무 큽니다</p>
            <p className="text-body-400 text-gr-200 mb-6">
              이미지 한 장당 최대 2.5MB까지<br />업로드할 수 있습니다.
            </p>
            <button
              onClick={() => setSizeErrorModal(false)}
              className="bg-primary text-white px-6 py-2 rounded-lg text-body-500 hover:opacity-90 w-full"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
