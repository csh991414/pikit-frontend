import React from 'react';
import { cn } from '@/lib/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-md border border-line-100 bg-bg-200 p-4 transition-colors hover:border-line-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
