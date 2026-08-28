import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'gradient-border';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const base = 'rounded-2xl border transition-all duration-200';

    const variants = {
      default: 'bg-slate-900 border-slate-800 text-white',
      glass: 'bg-slate-900/70 backdrop-blur-md border-slate-800/80 text-white',
      interactive: 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 hover:shadow-xl text-white cursor-pointer',
      'gradient-border': 'bg-slate-900 border-transparent relative text-white',
    };

    return (
      <div ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
