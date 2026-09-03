import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  color = 'text-slate-700',
  bg = 'bg-slate-100',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center mb-2.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
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
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
      <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-sm font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
      <p className="text-sm text-slate-500">{message}</p>
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
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <p className="text-sm text-red-600 text-center max-w-md">{message}</p>
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
  bgColor = 'bg-slate-100',
}: {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`h-1.5 ${bgColor} rounded-full overflow-hidden`}>
      <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}
