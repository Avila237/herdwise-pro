import { useEffect, useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Beef, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MetricCard as MetricCardType, DashboardData } from '@/types/database';
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const loading = farmLoading || animalsLoading || eventsLoading;

  useEffect(() => {
    if (animals.length === 0) {
      setDashboardData(null);
      return;
    }

    // Calculate dashboard metrics
    const totalAnimals = animals.length;
    const pregnantCount = animals.filter(a => a.reproductive_status === 'prenha').length;
    const inseminatedCount = animals.filter(a => a.reproductive_status === 'inseminada').length;
    const emptyCount = animals.filter(a => a.reproductive_status === 'vazia').length;
    const dryCount = animals.filter(a => a.reproductive_status === 'seca').length;

    const animalsWithDEL = animals.filter(a => a.current_del != null);
    const averageDEL = animalsWithDEL.length > 0
      ? animalsWithDEL.reduce((sum, a) => sum + (a.current_del || 0), 0) / animalsWithDEL.length
      : undefined;

    const animalsWithDEA = animals.filter(a => a.current_dea != null);
    const averageDEA = animalsWithDEA.length > 0
      ? animalsWithDEA.reduce((sum, a) => sum + (a.current_dea || 0), 0) / animalsWithDEA.length
      : undefined;

    // Calculate pregnancy rate
    const eligibleAnimals = animals.filter(a => 
      a.reproductive_status !== 'seca' && a.productive_status === 'lactacao'
    );
    const pregnancyRate = eligibleAnimals.length > 0
      ? (pregnantCount / eligibleAnimals.length) * 100
      : 0;

    // Create metric cards
    const metrics: MetricCardType[] = [
      {
        id: '1',
        name: 'taxa_prenhez',
        displayName: 'Taxa de Prenhez',
        value: pregnancyRate,
        format: 'percentage',
        decimals: 1,
        targetValue: 25,
        warningThreshold: 18,
        higherIsBetter: true,
        status: pregnancyRate >= 25 ? 'good' : pregnancyRate >= 18 ? 'warning' : 'bad',
      },
      {
        id: '2',
        name: 'del_medio',
        displayName: 'DEL Médio',
        value: averageDEL || null,
        format: 'integer',
        unit: 'dias',
        targetValue: 150,
        higherIsBetter: false,
        status: averageDEL ? (averageDEL <= 150 ? 'good' : averageDEL <= 180 ? 'warning' : 'bad') : 'neutral',
      },
      {
        id: '3',
        name: 'dea_medio',
        displayName: 'DEA Médio',
        value: averageDEA || null,
        format: 'integer',
        unit: 'dias',
        targetValue: 120,
        higherIsBetter: false,
        status: averageDEA ? (averageDEA <= 120 ? 'good' : averageDEA <= 150 ? 'warning' : 'bad') : 'neutral',
      },
      {
        id: '4',
        name: 'vacas_prenhas',
        displayName: 'Vacas Prenhas',
        value: pregnantCount,
        format: 'integer',
        higherIsBetter: true,
        status: 'neutral',
      },
    ];

    setDashboardData({
      metrics,
      animalsCount: totalAnimals,
      pregnantCount,
      inseminatedCount,
      emptyCount,
      averageDEL,
      averageDEA,
    });
  }, [animals]);

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
    { name: 'Prenhas', value: dashboardData?.pregnantCount || 0, color: 'hsl(var(--success))' },
    { name: 'Inseminadas', value: dashboardData?.inseminatedCount || 0, color: 'hsl(var(--info))' },
    { name: 'Vazias', value: dashboardData?.emptyCount || 0, color: 'hsl(var(--destructive))' },
    { name: 'Secas', value: animals.filter(a => a.reproductive_status === 'seca').length, color: 'hsl(var(--muted-foreground))' },
  ];

  const categoryData = [
    { name: 'Vacas', value: animals.filter(a => a.category === 'vaca').length },
    { name: 'Novilhas', value: animals.filter(a => a.category === 'novilha').length },
  ];

  return (
    <div className="space-y-6">
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
        {dashboardData?.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
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
                <p className="text-2xl font-bold">{dashboardData?.animalsCount}</p>
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
                <p className="text-2xl font-bold">{dashboardData?.pregnantCount}</p>
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
                <p className="text-2xl font-bold">{dashboardData?.inseminatedCount}</p>
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
                <p className="text-2xl font-bold">{dashboardData?.emptyCount}</p>
                <p className="text-sm text-muted-foreground">Vazias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
