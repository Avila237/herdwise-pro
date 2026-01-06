import { cn } from '@/lib/utils';
import type { MetricCard as MetricCardType } from '@/types/database';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  metric: MetricCardType;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const formatValue = (value: number | null): string => {
    if (value === null) return '—';
    
    const decimals = metric.decimals ?? 2;
    
    switch (metric.format) {
      case 'percentage':
        return `${value.toFixed(decimals)}%`;
      case 'integer':
        return Math.round(value).toString();
      case 'decimal':
      default:
        return value.toFixed(decimals);
    }
  };

  const statusColors = {
    good: 'border-l-success bg-success/5',
    warning: 'border-l-warning bg-warning/5',
    bad: 'border-l-destructive bg-destructive/5',
    neutral: 'border-l-muted-foreground',
  };

  const statusIcons = {
    good: <TrendingUp className="w-4 h-4 text-success" />,
    warning: <Minus className="w-4 h-4 text-warning" />,
    bad: <TrendingDown className="w-4 h-4 text-destructive" />,
    neutral: null,
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm border-l-4 transition-all hover:shadow-md',
        statusColors[metric.status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            {metric.displayName}
          </p>
          <p className="text-2xl font-bold mt-1">
            {formatValue(metric.value)}
            {metric.unit && metric.format !== 'percentage' && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metric.unit}
              </span>
            )}
          </p>
        </div>
        {statusIcons[metric.status]}
      </div>
      
      {metric.targetValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Meta: {formatValue(metric.targetValue)}
          </p>
        </div>
      )}
    </div>
  );
}
