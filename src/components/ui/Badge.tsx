import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'stone' | 'orange';
  className?: string;
}

const colorClasses: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  stone: 'bg-stone-100 text-stone-700 border-stone-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
