'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authApi } from '@/lib/api';
import LoginModal from '@/components/auth/LoginModal';
import HeaderSearchBar from './HeaderSearchBar';

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6h16M3 11h16M3 16h16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5l12 12M17 5L5 17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M13.5 13.5L17 17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const Header = () => {
  const { isAuthenticated, isAdmin, user, clearAuth } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      // Ignore errors during logout
    }
    clearAuth();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
     if (pathname === '/') {
      window.location.reload(); // 홈화면이면 강제 새로고침
    } else {
      router.push('/'); // 다른 화면이면 홈으로 이동
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };

  const menuItems = [
    { label: '프롬프트', href: '/' },
    //{ label: '질문해요', href: '/qa' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-line-100 bg-bg-100">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 md:px-6">
          {/* Left Area: Logo & Desktop Menu */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center"
            >
              <img src="/logo.png" alt="Pickit" className="h-5 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-5">
              {menuItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/' || pathname.startsWith('/prompts')
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-body-500 transition-colors hover:text-gr-100 ${
                      isActive ? 'font-medium text-gr-100' : 'text-gr-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {mounted && isAuthenticated && isAdmin && (
                <Link
                  href="/admin/prompts"
                  className={`text-body-500 transition-colors hover:text-gr-100 ${
                    pathname.startsWith('/admin')
                      ? 'font-medium text-gr-100'
                      : 'text-gr-200'
                  }`}
                >
                  프롬프트 관리
                </Link>
              )}
            </nav>
          </div>

          {/* Center: Desktop Search */}
          <HeaderSearchBar className="mx-4 hidden max-w-[380px] flex-1 md:flex" />

          {/* Right Area */}
          <div className="flex items-center gap-2">
            {/* Mobile: search icon + hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => {
                  setIsMobileSearchOpen((v) => !v);
                  setIsMobileMenuOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-gr-200 hover:text-gr-100 transition-colors"
                aria-label="검색"
              >
                <SearchIcon />
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen((v) => !v);
                  setIsMobileSearchOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-gr-200 hover:text-gr-100 transition-colors"
                aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>

            {/* Desktop: Auth */}
            <div className="hidden md:flex items-center gap-2">
              {!mounted ? (
                <div className="h-9 w-20" />
              ) : isAuthenticated && user ? (
                <div
                  ref={dropdownRef}
                  className="relative flex items-center gap-2"
                >
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    <span className="text-body-500 text-gr-100">
                      {user.nickname}
                    </span>
                    <span className="text-body-400 text-gr-100">님</span>
                  </div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-caption-lg-500 text-primary"
                    style={{ backgroundColor: '#FFF5EC' }}
                  >
                    {user.nickname?.charAt(0).toUpperCase()}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-md border border-line-100 bg-bg-100 shadow-lg">
                      <Link
                        href="/my"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block w-full px-4 py-2 text-left text-caption-lg-500 text-gr-200 hover:bg-bg-200 hover:text-gr-100"
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-caption-lg-500 text-gr-200 hover:bg-bg-200 hover:text-gr-100 border-t border-line-100"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="h-9 rounded-sm px-4 text-caption-lg-500 text-gr-100 transition-colors hover:text-gr-300 flex items-center"
                  >
                    회원가입
                  </Link>
                  <button
                    onClick={openLoginModal}
                    className="flex items-center rounded-sm bg-primary px-4 text-caption-lg-500 text-white transition-all hover:opacity-90"
                    style={{ height: '36px' }}
                  >
                    로그인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (expands below header) */}
        {isMobileSearchOpen && (
          <div className="border-t border-line-100 px-4 py-2 md:hidden">
            <HeaderSearchBar
              className="w-full"
              autoFocus
              onSearch={() => setIsMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed left-0 top-14 z-40 h-[calc(100dvh-56px)] w-72 bg-bg-100 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Nav Links */}
          <nav className="flex flex-col border-b border-line-100 px-2 py-3">
            {menuItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/' || pathname.startsWith('/prompts')
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center rounded-md px-4 py-3 text-body-500 transition-colors hover:bg-bg-200 hover:text-gr-100 ${
                    isActive
                      ? 'bg-bg-200 font-medium text-gr-100'
                      : 'text-gr-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {mounted && isAuthenticated && isAdmin && (
              <Link
                href="/admin/prompts"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-md px-4 py-3 text-body-500 transition-colors hover:bg-bg-200 hover:text-gr-100 ${
                  pathname.startsWith('/admin')
                    ? 'bg-bg-200 font-medium text-gr-100'
                    : 'text-gr-200'
                }`}
              >
                프롬프트 관리
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="px-4 py-4">
            {!mounted ? null : isAuthenticated && user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-md bg-bg-200 px-4 py-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-caption-lg-500 text-primary"
                    style={{ backgroundColor: '#FFF5EC' }}
                  >
                    {user.nickname?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-body-500 text-gr-100">
                      {user.nickname}
                      <span className="text-body-400"> 님</span>
                    </p>
                  </div>
                </div>
                <Link
                  href="/my"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-md border border-line-100 py-2.5 text-caption-lg-500 text-gr-200 transition-colors hover:bg-bg-200 hover:text-gr-100"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md border border-line-100 py-2.5 text-caption-lg-500 text-gr-200 transition-colors hover:bg-bg-200 hover:text-gr-100"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-sm bg-primary py-2.5 text-caption-lg-500 text-white transition-all hover:opacity-90"
                >
                  로그인
                </button>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-sm border border-line-100 py-2.5 text-caption-lg-500 text-gr-100 transition-colors hover:bg-bg-200"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal />
    </>
  );
};

export { Header };
