'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authApi } from '@/lib/api';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const { isLoginModalOpen, closeLoginModal } = useUIStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login({ username: email, password });
      setAuth(response);
      closeLoginModal();
      window.location.reload();
    } catch (err) {
      setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={closeLoginModal} />

      <div className="relative w-[480px] rounded-2xl bg-bg-100 p-6 shadow-xl">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={closeLoginModal}
            className="text-gr-300 transition-colors hover:text-gr-100"
          >
            <X size={24} />
          </button>
        </div>

        <h2 className="mb-5 mt-4 text-center text-heading-lg text-gr-100">
          로그인
        </h2>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col" style={{ gap: '12px' }}>
            {/* Email Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="이메일을 입력해주세요."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-md border px-4 py-3 text-body-400 placeholder:text-body-500 placeholder:text-gr-300 focus:outline-none ${
                  errorMessage
                    ? 'border-danger'
                    : 'border-line-100 focus:border-primary'
                }`}
              />
            </div>

            {/* Password Input + Error */}
            <div className="flex flex-col" style={{ gap: '6px' }}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해주세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-md border px-4 py-3 pr-10 text-body-400 placeholder:text-body-500 placeholder:text-gr-300 focus:outline-none ${
                    errorMessage
                      ? 'border-danger'
                      : 'border-line-100 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gr-300 hover:text-gr-100"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <p className="text-caption-lg-400 text-danger">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="#"
                className="text-caption-lg-400 text-gr-100 hover:text-gr-100"
              >
                비밀번호 찾기
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary py-3 text-body-500 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-caption-lg-400 text-gr-200">
          아직도 피킷 회원이 아니신가요?{' '}
          <Link
            href="/signup"
            onClick={closeLoginModal}
            className="text-caption-lg-500 font-bold text-gr-100 hover:underline"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
