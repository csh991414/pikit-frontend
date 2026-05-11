'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 입력해주세요');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await authApi.login({ username, password });
      setAuth(response);
      router.push('/');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-mono font-bold text-primary-100 mb-2">
          [ pikit ]
        </h1>
        <p className="text-gray-300 font-mono text-sm">
          // login
        </p>
      </div>

      <div className="w-full max-w-[400px] bg-bg-200 border border-line-100 rounded-lg p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {errorMessage && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3 font-mono text-sm">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full font-mono"
            disabled={isLoading}
          >
            {isLoading ? 'logging in...' : 'login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/signup" 
            className="text-primary-100 hover:text-primary-200 font-mono text-sm"
          >
            // 계정이 없다면? signup
          </Link>
        </div>
      </div>
    </div>
  );
}
