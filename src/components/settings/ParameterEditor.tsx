import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, History } from 'lucide-react';
import type { Parameter } from '@/types/database';

interface ParameterConfig {
  name: string;
  label: string;
  description: string;
  unit: string;
  defaultValue: number;
}

const PARAMETER_CONFIGS: ParameterConfig[] = [
  {
    name: 'del_maximo',
    label: 'DEL Máximo',
    description: 'Dias em lactação máximo para considerar animal apto',
    unit: 'dias',
    defaultValue: 150,
  },
  {
    name: 'periodo_voluntario_espera',
    label: 'Período Voluntário de Espera',
    description: 'Dias mínimos pós-parto antes de iniciar reprodução',
    unit: 'dias',
    defaultValue: 45,
  },
  {
    name: 'janela_pos_ia',
    label: 'Janela Pós-IA',
    description: 'Dias após IA para considerar animal aguardando diagnóstico',
    unit: 'dias',
    defaultValue: 45,
  },
  {
    name: 'dias_dg1',
    label: 'Dias para DG1',
    description: 'Dias após IA para primeiro diagnóstico de gestação',
    unit: 'dias',
    defaultValue: 30,
  },
  {
    name: 'dias_dg2',
    label: 'Dias para DG2',
    description: 'Dias após IA para confirmação de gestação',
    unit: 'dias',
    defaultValue: 60,
  },
  {
    name: 'idade_minima_novilha',
    label: 'Idade Mínima Novilha',
    description: 'Idade mínima em meses para novilha entrar em reprodução',
    unit: 'meses',
    defaultValue: 14,
  },
];

interface ParameterEditorProps {
  parameters: Parameter[];
  onSave: (name: string, value: string) => Promise<Parameter | null>;
}

export function ParameterEditor({ parameters, onSave }: ParameterEditorProps) {
  const { toast } = useToast();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const getCurrentValue = (name: string): string => {
    if (editedValues[name] !== undefined) {
      return editedValues[name];
    }
    const param = parameters.find(p => p.name === name && p.is_current);
    if (param) {
      return param.value;
    }
    const config = PARAMETER_CONFIGS.find(c => c.name === name);
    return config?.defaultValue.toString() || '';
  };

  const getParameterVersion = (name: string): number => {
    const param = parameters.find(p => p.name === name && p.is_current);
    return param?.version || 0;
  };

  const hasChanges = (name: string): boolean => {
    const currentParam = parameters.find(p => p.name === name && p.is_current);
    const editedValue = editedValues[name];
    
    if (editedValue === undefined) return false;
    if (!currentParam) return true;
    
    return currentParam.value !== editedValue;
  };

  const handleChange = (name: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (name: string) => {
    const value = editedValues[name];
    if (value === undefined) return;

    setSaving(name);
    try {
      const config = PARAMETER_CONFIGS.find(c => c.name === name);
      const result = await onSave(name, value);
      
      if (result) {
        toast({
          title: 'Parâmetro atualizado',
          description: `${config?.label || name} salvo com sucesso (v${result.version})`,
        });
        setEditedValues(prev => {
          const newValues = { ...prev };
          delete newValues[name];
          return newValues;
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o parâmetro',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros Reprodutivos</CardTitle>
        <CardDescription>
          Configure os parâmetros que controlam cálculos e regras do sistema.
          Cada alteração cria uma nova versão para auditoria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {PARAMETER_CONFIGS.map((config) => {
            const version = getParameterVersion(config.name);
            const changed = hasChanges(config.name);
            
            return (
              <div
                key={config.name}
                className="p-4 rounded-lg border bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Label htmlFor={config.name} className="font-medium">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {config.description}
                    </p>
                  </div>
                  {version > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <History className="w-3 h-3" />
                      v{version}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    id={config.name}
                    type="number"
                    value={getCurrentValue(config.name)}
                    onChange={(e) => handleChange(config.name, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {config.unit}
                  </span>
                  {changed && (
                    <Button
                      size="sm"
                      onClick={() => handleSave(config.name)}
                      disabled={saving === config.name}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
