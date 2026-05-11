import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '@/lib/utils';

const SearchBar = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', className)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={ref}
          className="pl-10"
          placeholder="search prompts..."
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar };
