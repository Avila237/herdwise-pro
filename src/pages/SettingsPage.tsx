import { useFarmContext } from '@/hooks/useFarm';
import { useLots } from '@/hooks/useLots';
import { useParameters } from '@/hooks/useParameters';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ParameterEditor } from '@/components/settings/ParameterEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function SettingsPage() {
  const { currentFarm, farms, loading: farmLoading } = useFarmContext();
  const { lots } = useLots({ farmId: currentFarm?.id });
  const { parameters, setParameter, loading: paramsLoading } = useParameters({ farmId: currentFarm?.id });

  const handleSaveParameter = async (name: string, value: string) => {
    return await setParameter(name, value, 'number');
  };

  if (farmLoading) {
    return <LoadingPage message="Carregando configurações..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Demo Alert */}
      <Alert className="border-warning/50 bg-warning/10">
        <Info className="h-4 w-4 text-warning" />
        <AlertDescription className="text-foreground">
          <strong>Modo Demonstração:</strong> A criação e edição de fazendas está desabilitada. 
          Explore as funcionalidades do sistema com os dados fictícios disponíveis.
        </AlertDescription>
      </Alert>

      {/* Farm Display (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Fazenda</CardTitle>
          <CardDescription>Fazenda configurada para demonstração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {farms.map((farm) => (
              <div key={farm.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{farm.name}</p>
                  {farm.location && <p className="text-sm text-muted-foreground">{farm.location}</p>}
                </div>
                {currentFarm?.id === farm.id && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Ativa</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lots Display (Read-only) */}
      {currentFarm && (
        <Card>
          <CardHeader>
            <CardTitle>Lotes</CardTitle>
            <CardDescription>Lotes cadastrados na {currentFarm.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum lote cadastrado</p>
              ) : (
                lots.map((lot) => (
                  <div key={lot.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{lot.name}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parameter Editor */}
      {currentFarm && !paramsLoading && (
        <ParameterEditor 
          parameters={parameters} 
          onSave={handleSaveParameter}
        />
      )}
    </div>
  );
}
