import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <Info className="w-4 h-4" />
      <span>
        <strong>VERSÃO DEMO</strong> — Esta é uma versão de demonstração com dados fictícios
      </span>
    </div>
  );
}
