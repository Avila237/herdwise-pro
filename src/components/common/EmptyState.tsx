import { ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Ocorreu um erro', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Erro</h3>
        <p className="text-muted-foreground mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
