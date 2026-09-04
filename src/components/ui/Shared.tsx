import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">{title}</h1>
        <p className="text-sm text-charcoal-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
  color = 'text-charcoal-700',
  bg = 'bg-charcoal-100',
}: {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-200 shadow-sm p-4 hover:shadow-md hover:border-charcoal-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-md flex items-center justify-center', bg)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-charcoal-900 leading-tight tabular-nums">
        {value}
        {unit && <span className="text-sm font-medium text-charcoal-400 ml-1">{unit}</span>}
      </p>
      <p className="text-xs font-medium text-charcoal-600 mt-1">{label}</p>
      {description && <p className="text-[11px] text-charcoal-400 mt-0.5 leading-relaxed">{description}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-200 shadow-sm p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-charcoal-300" />
      </div>
      <p className="text-base font-semibold text-charcoal-900 mb-1.5">{title}</p>
      <p className="text-sm text-charcoal-500 mb-5 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
      <p className="text-sm text-charcoal-500">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-charcoal-200 shadow-sm p-4">
      <div className="skeleton-shimmer w-9 h-9 rounded-md mb-3" />
      <div className="skeleton-shimmer h-7 w-20 rounded mb-2" />
      <div className="skeleton-shimmer h-3 w-28 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="skeleton-shimmer w-8 h-8 rounded-md" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer h-3 w-32 rounded" />
        <div className="skeleton-shimmer h-2.5 w-48 rounded" />
      </div>
      <div className="skeleton-shimmer h-5 w-16 rounded" />
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-600" />
      </div>
      <p className="text-sm font-medium text-red-600 text-center max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-emerald-500',
  bgColor = 'bg-charcoal-100',
}: {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('h-2 rounded-full overflow-hidden', bgColor)}>
      <div className={cn('h-full rounded-full transition-all duration-500 ease-out', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function InsightBanner({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="bg-gradient-to-r from-charcoal-50 to-amber-50/50 border border-charcoal-200 rounded-lg p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-amber-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-charcoal-900">{title}</h3>
          <div className="text-sm text-charcoal-600 mt-1">{children}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
