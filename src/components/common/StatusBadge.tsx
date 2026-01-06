import { cn } from '@/lib/utils';
import type { ReproductiveStatus } from '@/types/database';

interface StatusBadgeProps {
  status: ReproductiveStatus;
  className?: string;
}

const statusConfig: Record<ReproductiveStatus, { label: string; className: string }> = {
  prenha: {
    label: 'Prenha',
    className: 'bg-success/15 text-success border-success/30',
  },
  vazia: {
    label: 'Vazia',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  inseminada: {
    label: 'Inseminada',
    className: 'bg-info/15 text-info border-info/30',
  },
  seca: {
    label: 'Seca',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.vazia;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
