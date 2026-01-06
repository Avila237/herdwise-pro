import { useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useLots } from '@/hooks/useLots';
import { useParameters } from '@/hooks/useParameters';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Settings2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentFarm, farms, createFarm, loading: farmLoading } = useFarmContext();
  const { lots, createLot, deleteLot } = useLots({ farmId: currentFarm?.id });
  const { parameters, setParameter } = useParameters({ farmId: currentFarm?.id });

  const [newFarmName, setNewFarmName] = useState('');
  const [newLotName, setNewLotName] = useState('');

  const handleCreateFarm = async () => {
    if (!newFarmName.trim()) return;
    const farm = await createFarm(newFarmName.trim());
    if (farm) {
      toast({ title: 'Fazenda criada com sucesso' });
      setNewFarmName('');
    }
  };

  const handleCreateLot = async () => {
    if (!newLotName.trim()) return;
    const lot = await createLot(newLotName.trim());
    if (lot) {
      toast({ title: 'Lote criado com sucesso' });
      setNewLotName('');
    }
  };

  if (farmLoading) {
    return <LoadingPage message="Carregando configurações..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Farm Management */}
      <Card>
        <CardHeader>
          <CardTitle>Fazendas</CardTitle>
          <CardDescription>Gerencie as fazendas do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nome da nova fazenda"
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFarm()}
            />
            <Button onClick={handleCreateFarm}>
              <Plus className="w-4 h-4 mr-2" />
              Criar
            </Button>
          </div>
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

      {/* Lot Management */}
      {currentFarm && (
        <Card>
          <CardHeader>
            <CardTitle>Lotes</CardTitle>
            <CardDescription>Gerencie os lotes da fazenda {currentFarm.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Nome do novo lote"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLot()}
              />
              <Button onClick={handleCreateLot}>
                <Plus className="w-4 h-4 mr-2" />
                Criar
              </Button>
            </div>
            <div className="space-y-2">
              {lots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum lote cadastrado</p>
              ) : (
                lots.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{lot.name}</p>
                    <Button variant="ghost" size="icon" onClick={() => deleteLot(lot.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parameters */}
      {currentFarm && (
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros</CardTitle>
            <CardDescription>Configure os parâmetros reprodutivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <Label className="text-muted-foreground">DEL Máximo</Label>
                <p className="text-2xl font-bold">150 dias</p>
              </div>
              <div className="p-4 rounded-lg border">
                <Label className="text-muted-foreground">Janela Pós-IA</Label>
                <p className="text-2xl font-bold">45 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
