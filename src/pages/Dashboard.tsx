import { useEffect, useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useMetrics } from '@/hooks/useMetrics';
import { useParameters } from '@/hooks/useParameters';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Beef, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MetricCard as MetricCardType } from '@/types/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentFarm, loading: farmLoading } = useFarmContext();
  const { animals, loading: animalsLoading } = useAnimals({ farmId: currentFarm?.id });
  const { events, loading: eventsLoading } = useEvents({ farmId: currentFarm?.id });
  const { parameters, loading: paramsLoading, getParametersMap } = useParameters({ farmId: currentFarm?.id });
  const { definitions, calculateMetrics, loading: metricsLoading } = useMetrics({ 
    farmId: currentFarm?.id,
  });
  
  const [metricCards, setMetricCards] = useState<MetricCardType[]>([]);

  const loading = farmLoading || animalsLoading || eventsLoading || metricsLoading || paramsLoading;

  useEffect(() => {
    const calculate = async () => {
      if (definitions.length > 0 && animals.length > 0 && !paramsLoading) {
        try {
          const params = getParametersMap();
          const cards = await calculateMetrics(animals, events, params);
          setMetricCards(cards);
        } catch (err) {
          console.error('Error calculating metrics:', err);
          setMetricCards([]);
        }
      } else {
        setMetricCards([]);
      }
    };
    calculate();
  }, [definitions, animals, events, calculateMetrics, parameters, paramsLoading, getParametersMap]);

  // Calculate counts for charts
  const pregnantCount = animals.filter(a => a.reproductive_status === 'prenha').length;
  const inseminatedCount = animals.filter(a => a.reproductive_status === 'inseminada').length;
  const emptyCount = animals.filter(a => a.reproductive_status === 'vazia').length;
  const dryCount = animals.filter(a => a.reproductive_status === 'seca').length;

  if (loading) {
    return <LoadingPage message="Carregando dashboard..." />;
  }

  if (!currentFarm) {
    return (
      <EmptyState
        icon={<Beef className="w-8 h-8" />}
        title="Nenhuma fazenda selecionada"
        description="Crie ou selecione uma fazenda para começar"
        action={{
          label: 'Criar Fazenda',
          onClick: () => navigate('/settings'),
        }}
      />
    );
  }

  if (animals.length === 0) {
    return (
      <EmptyState
        icon={<Beef className="w-8 h-8" />}
        title="Nenhum animal cadastrado"
        description="Comece cadastrando os animais do rebanho"
        action={{
          label: 'Cadastrar Animais',
          onClick: () => navigate('/animals'),
        }}
      />
    );
  }

  const statusData = [
    { name: 'Prenhas', value: pregnantCount, color: 'hsl(var(--success))' },
    { name: 'Inseminadas', value: inseminatedCount, color: 'hsl(var(--info))' },
    { name: 'Vazias', value: emptyCount, color: 'hsl(var(--destructive))' },
    { name: 'Secas', value: dryCount, color: 'hsl(var(--muted-foreground))' },
  ];

  const categoryData = [
    { name: 'Vacas', value: animals.filter(a => a.category === 'vaca').length },
    { name: 'Novilhas', value: animals.filter(a => a.category === 'novilha').length },
  ];

  // Get main metrics for display (first 4)
  const displayMetrics = metricCards.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Demo Welcome Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Beef className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Bem-vindo à Demo do ReproGestão!</h2>
              <p className="text-sm text-muted-foreground">
                Esta é uma versão de demonstração com dados fictícios. Explore todas as funcionalidades: 
                cadastre animais, registre eventos reprodutivos, acompanhe métricas e muito mais. 
                Os dados apresentados são ilustrativos e podem ser manipulados livremente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/animals')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Animal
        </Button>
        <Button variant="outline" onClick={() => navigate('/events')}>
          <Calendar className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayMetrics.length > 0 ? (
          displayMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))
        ) : (
          <>
            {/* Fallback cards when no metric definitions */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Taxa de Prenhez</p>
                <p className="text-2xl font-bold">
                  {animals.length > 0 
                    ? `${((pregnantCount / animals.filter(a => a.productive_status === 'lactacao').length) * 100 || 0).toFixed(1)}%`
                    : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Animais</p>
                <p className="text-2xl font-bold">{animals.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Prenhas</p>
                <p className="text-2xl font-bold">{pregnantCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Vazias</p>
                <p className="text-2xl font-bold">{emptyCount}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Beef className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{animals.length}</p>
                <p className="text-sm text-muted-foreground">Total de Animais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pregnantCount}</p>
                <p className="text-sm text-muted-foreground">Prenhas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-info/10">
                <Calendar className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inseminatedCount}</p>
                <p className="text-sm text-muted-foreground">Inseminadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emptyCount}</p>
                <p className="text-sm text-muted-foreground">Vazias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
