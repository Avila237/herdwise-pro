import { useState, useMemo } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useEvents } from '@/hooks/useEvents';
import { useAnimals } from '@/hooks/useAnimals';
import { useLots } from '@/hooks/useLots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Syringe, 
  Stethoscope, 
  Baby, 
  AlertTriangle,
  Clock,
  Filter,
  Trash2
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Event } from '@/types/database';

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ia: { label: 'IA', icon: <Syringe className="h-4 w-4" />, color: 'bg-blue-500' },
  iatf: { label: 'Protocolo IATF', icon: <Syringe className="h-4 w-4" />, color: 'bg-indigo-500' },
  diagnostico: { label: 'Diagnóstico', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-purple-500' },
  parto: { label: 'Parto', icon: <Baby className="h-4 w-4" />, color: 'bg-green-500' },
  secagem: { label: 'Secagem', icon: <Clock className="h-4 w-4" />, color: 'bg-amber-500' },
  descarte: { label: 'Descarte', icon: <Trash2 className="h-4 w-4" />, color: 'bg-red-500' },
  campo: { label: 'Campo', icon: <Clock className="h-4 w-4" />, color: 'bg-gray-500' },
  sanitario: { label: 'Sanitário', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-teal-500' },
};

export default function HistoryPage() {
  const { currentFarm, loading: farmLoading } = useFarmContext();
  const { events, loading: eventsLoading } = useEvents({ farmId: currentFarm?.id });
  const { animals, loading: animalsLoading } = useAnimals({ farmId: currentFarm?.id });
  const { lots } = useLots({ farmId: currentFarm?.id });

  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const loading = farmLoading || eventsLoading || animalsLoading;

  // Create animal lookup map
  const animalMap = useMemo(() => {
    const map: Record<string, string> = {};
    animals.forEach(a => {
      map[a.id] = a.identification || a.name || 'Sem ID';
    });
    return map;
  }, [animals]);

  // Filter events based on selections
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filter by tab (event type)
      if (selectedTab !== 'all' && event.event_type !== selectedTab) {
        return false;
      }

      // Filter by animal
      if (selectedAnimal !== 'all' && event.animal_id !== selectedAnimal) {
        return false;
      }

      // Filter by lot
      if (selectedLot !== 'all') {
        const animal = animals.find(a => a.id === event.animal_id);
        if (!animal || animal.lot_id !== selectedLot) {
          return false;
        }
      }

      // Filter by date range
      if (dateRange.from && dateRange.to) {
        const eventDate = parseISO(event.event_date);
        if (!isWithinInterval(eventDate, { start: dateRange.from, end: dateRange.to })) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }, [events, selectedTab, selectedAnimal, selectedLot, dateRange, animals]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    filteredEvents.forEach(event => {
      const date = event.event_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const exportToCSV = () => {
    const headers = ['Data', 'Animal', 'Tipo', 'Subtipo', 'Touro/Técnico', 'Resultado', 'Notas'];
    const rows = filteredEvents.map(e => [
      e.event_date,
      animalMap[e.animal_id] || e.animal_id,
      EVENT_TYPE_CONFIG[e.event_type]?.label || e.event_type,
      e.event_subtype || '',
      e.bull_name || e.inseminator_name || '',
      e.diagnosis_result || '',
      e.notes || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentFarm) {
    return <EmptyState title="Nenhuma fazenda selecionada" description="Selecione uma fazenda para ver o histórico" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
          <p className="text-muted-foreground">Visualize todos os eventos registrados</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM', { locale: ptBR })} - {format(dateRange.to, 'dd/MM', { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                    )
                  ) : (
                    'Período'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Animal Filter */}
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os animais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os animais</SelectItem>
                {animals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.identification || animal.name || 'Sem ID'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lot Filter */}
            <Select value={selectedLot} onValueChange={setSelectedLot}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os lotes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os lotes</SelectItem>
                {lots.map(lot => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedAnimal('all');
                setSelectedLot('all');
                setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
                setSelectedTab('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs by Event Type */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos ({events.length})</TabsTrigger>
          <TabsTrigger value="ia" className="gap-1">
            <Syringe className="h-3 w-3" /> IA ({events.filter(e => e.event_type === 'ia').length})
          </TabsTrigger>
          <TabsTrigger value="iatf" className="gap-1">
            <Syringe className="h-3 w-3" /> IATF ({events.filter(e => e.event_type === 'iatf').length})
          </TabsTrigger>
          <TabsTrigger value="diagnostico" className="gap-1">
            <Stethoscope className="h-3 w-3" /> DG ({events.filter(e => e.event_type === 'diagnostico').length})
          </TabsTrigger>
          <TabsTrigger value="parto" className="gap-1">
            <Baby className="h-3 w-3" /> Partos ({events.filter(e => e.event_type === 'parto').length})
          </TabsTrigger>
          <TabsTrigger value="descarte" className="gap-1">
            <Trash2 className="h-3 w-3" /> Descartes ({events.filter(e => e.event_type === 'descarte').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filteredEvents.length === 0 ? (
            <EmptyState 
              title="Nenhum evento encontrado" 
              description="Ajuste os filtros ou registre novos eventos"
            />
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{filteredEvents.length} eventos</Badge>
                <span>em {Object.keys(groupedEvents).length} dias</span>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        <Badge variant="outline" className="ml-2">{dayEvents.length}</Badge>
                      </h3>
                    </div>

                    {/* Events for this date */}
                    <div className="ml-6 border-l-2 border-muted pl-4 space-y-3">
                      {dayEvents.map(event => {
                        const config = EVENT_TYPE_CONFIG[event.event_type] || { 
                          label: event.event_type, 
                          icon: <Clock className="h-4 w-4" />,
                          color: 'bg-gray-500'
                        };

                        return (
                          <Card key={event.id} className="relative">
                            {/* Timeline dot */}
                            <div className={cn(
                              "absolute -left-[1.65rem] top-4 h-3 w-3 rounded-full border-2 border-background",
                              config.color
                            )} />

                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn("gap-1", config.color)}>
                                      {config.icon}
                                      {config.label}
                                    </Badge>
                                    {event.event_subtype && (
                                      <Badge variant="outline">{event.event_subtype}</Badge>
                                    )}
                                  </div>
                                  
                                  <p className="mt-2 font-medium text-foreground">
                                    {animalMap[event.animal_id] || 'Animal não encontrado'}
                                  </p>

                                  <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
                                    {event.bull_name && <p>Touro: {event.bull_name}</p>}
                                    {event.inseminator_name && <p>Inseminador: {event.inseminator_name}</p>}
                                    {event.diagnosis_result && (
                                      <p className={cn(
                                        "font-medium",
                                        event.diagnosis_result === 'prenha' && 'text-green-600',
                                        event.diagnosis_result === 'vazia' && 'text-red-600',
                                        event.diagnosis_result === 'perda' && 'text-orange-600'
                                      )}>
                                        Resultado: {event.diagnosis_result}
                                      </p>
                                    )}
                                    {event.calving_ease && <p>Facilidade de parto: {event.calving_ease}</p>}
                                    {event.calf_sex && <p>Sexo do bezerro: {event.calf_sex}</p>}
                                    {event.notes && <p className="italic">"{event.notes}"</p>}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
