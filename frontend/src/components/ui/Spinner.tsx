import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 size={sizes} className="animate-spin text-blue-500" />
      {label && <p className="text-sm font-medium text-slate-400">{label}</p>}
    </div>
  );
}
