'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { Nav } from './Nav';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

const Header = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore errors during logout (e.g. token expired)
    }
    clearAuth();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line-100 bg-bg-100/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center font-mono text-xl font-bold text-primary-100">
            <span>pickit</span>
            <span className="ml-0.5 h-5 w-2 bg-primary-100 animate-blink"></span>
          </Link>
          <div className="hidden md:block">
            <Nav />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 md:max-w-md">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          {!mounted ? (
            <div className="w-[160px] h-9" />
          ) : isAuthenticated && user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded font-mono text-gray-100 hover:bg-bg-200 transition-colors"
              >
                <span>@{user.nickname}</span>
                <ChevronDown size={16} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-200 border border-line-100 rounded-md shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => {
                      alert('준비 중');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-mono text-sm text-gray-100 hover:bg-bg-100 transition-colors"
                  >
                    // my page
                  </button>
                  <div className="border-t border-line-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 font-mono text-sm text-gray-100 hover:bg-bg-100 transition-colors"
                  >
                    // logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-sans">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm" className="font-sans">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
