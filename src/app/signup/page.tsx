'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      newErrors.username = '아이디는 영문/숫자 3-20자';
    }
    if (password.length < 8 || password.length > 64) {
      newErrors.password = '비밀번호는 8-64자';
    }
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }
    if (nickname.length < 1 || nickname.length > 20) {
      newErrors.nickname = '닉네임은 1-20자';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authApi.signup({ username, password, nickname });
      setAuth(response);
      router.push('/');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      if (msg.includes('아이디')) {
        setErrors({ username: msg });
      } else if (msg.includes('닉네임')) {
        setErrors({ nickname: msg });
      } else {
        setErrors({ form: msg });
      }
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
          // signup
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
              className={errors.username ? 'border-red-500/50' : ''}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-400 text-xs font-mono mt-1">{errors.username}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={errors.password ? 'border-red-500/50' : ''}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-xs font-mono mt-1">{errors.password}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="confirm password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isLoading}
              className={errors.passwordConfirm ? 'border-red-500/50' : ''}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.passwordConfirm && (
              <p className="text-red-400 text-xs font-mono mt-1">{errors.passwordConfirm}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLoading}
              className={errors.nickname ? 'border-red-500/50' : ''}
            />
            {errors.nickname && (
              <p className="text-red-400 text-xs font-mono mt-1">{errors.nickname}</p>
            )}
          </div>

          {errors.form && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3 font-mono text-sm">
              {errors.form}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full font-mono"
            disabled={isLoading}
          >
            {isLoading ? 'signing up...' : 'signup'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-primary-100 hover:text-primary-200 font-mono text-sm"
          >
            // 이미 계정이 있다면? login
          </Link>
        </div>
      </div>
    </div>
  );
}
