import React from 'react';
import { cn } from '@/lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'comment';
}

const Tag = ({ className, variant = 'default', children, ...props }: TagProps) => {
  const variants = {
    default: 'bg-gray-500 text-gray-100',
    primary: 'text-primary-100',
    comment: 'text-primary-100 before:content-["//_"]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-mono font-medium',
        variant === 'default' ? 'px-1.5' : 'px-0',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Tag };
