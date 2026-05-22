'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { promptApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface HeaderSearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onSearch?: () => void;
}

export default function HeaderSearchBar({ className, autoFocus, onSearch }: HeaderSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: number; title: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    let cancelled = false;
    promptApi.suggest(debouncedQuery).then((data) => {
      if (!cancelled) {
        setSuggestions(data);
        setShowDropdown(data.length > 0);
        setActiveIndex(-1);
      }
    }).catch(() => {
      // Ignore errors
    });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex].id);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowDropdown(false);
        onSearch?.();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (id: number) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/prompts/detail?id=${id}`);
    onSearch?.();
  };

  return (
    <div ref={searchBoxRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gr-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="프롬프트를 검색하세요"
          autoFocus={autoFocus}
          className="h-10 w-full rounded-md bg-bg-300 pl-10 pr-10 text-body-400 text-gr-100 placeholder:text-gr-300 outline-none focus:bg-bg-100 focus:ring-2 focus:ring-primary-light border-none transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gr-300 hover:text-gr-100 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 max-h-[320px] overflow-y-auto bg-bg-100 border border-line-100 rounded-lg shadow-lg z-50 py-1">
          {suggestions.map((s, idx) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelectSuggestion(s.id)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={cn(
                  'w-full text-left px-4 py-2 text-caption-lg-400 transition-colors',
                  idx === activeIndex ? 'bg-bg-200 text-primary font-medium' : 'hover:bg-bg-200 text-gr-100'
                )}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
