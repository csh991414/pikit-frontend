'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: '// all', href: '/' },
  { label: '// new', href: '/new' },
  { label: '// hot', href: '/hot' },
  { label: '// Q&A', href: '/qa' },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'font-mono text-sm transition-colors hover:text-gray-100',
              isActive
                ? 'text-primary-100 font-bold bg-primary-100/10 px-2 py-1 rounded-sm'
                : 'text-gray-300'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export { Nav };
