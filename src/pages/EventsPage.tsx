import { useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useEvents } from '@/hooks/useEvents';
import { useAnimals } from '@/hooks/useAnimals';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Calendar, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EventFormData, EventType, IAType, DiagnosisType, DiagnosisResult, CalfSex, CalvingEase } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const eventTypeLabels: Record<EventType, string> = {
  campo: 'Campo',
  ia: 'IA',
  iatf: 'IATF',
  sanitario: 'Sanitário',
  parto: 'Parto',
  secagem: 'Secagem',
  descarte: 'Descarte',
  diagnostico: 'Diagnóstico',
};

const initialFormData: Partial<EventFormData> = {
  event_type: 'ia',
  event_date: format(new Date(), 'yyyy-MM-dd'),
};

export default function EventsPage() {
  const { toast } = useToast();
  const { currentFarm, loading: farmLoading } = useFarmContext();
  const { events, loading, error, createEvent, deleteEvent, refresh } = useEvents({
    farmId: currentFarm?.id,
  });
  const { animals } = useAnimals({ farmId: currentFarm?.id });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<EventFormData>>(initialFormData);

  const filteredEvents = events.filter((event) => {
    const animal = event.animal;
    const matchesSearch = animal?.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.bull_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const openCreateForm = () => {
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animal_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um animal',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.event_date) {
      toast({
        title: 'Erro',
        description: 'Informe a data do evento',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createEvent(formData as EventFormData);
      toast({ title: 'Evento registrado com sucesso' });
      setIsFormOpen(false);
      setFormData(initialFormData);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o evento',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    
    const success = await deleteEvent(eventId);
    if (success) {
      toast({ title: 'Evento excluído com sucesso' });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o evento',
        variant: 'destructive',
      });
    }
  };

  if (farmLoading || loading) {
    return <LoadingPage message="Carregando eventos..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!currentFarm) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="Nenhuma fazenda selecionada"
        description="Selecione uma fazenda para ver os eventos"
      />
    );
  }

  const renderEventTypeFields = () => {
    switch (formData.event_type) {
      case 'ia':
      case 'iatf':
        return (
          <>
            <div>
              <Label htmlFor="ia_type">Tipo de IA</Label>
              <Select
                value={formData.ia_type || ''}
                onValueChange={(v) => setFormData({ ...formData, ia_type: v as IAType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cio">Cio Natural</SelectItem>
                  <SelectItem value="iatf">IATF</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bull_name">Touro</Label>
              <Input
                id="bull_name"
                value={formData.bull_name || ''}
                onChange={(e) => setFormData({ ...formData, bull_name: e.target.value })}
                placeholder="Nome do touro"
              />
            </div>
            <div>
              <Label htmlFor="inseminator_name">Inseminador</Label>
              <Input
                id="inseminator_name"
                value={formData.inseminator_name || ''}
                onChange={(e) => setFormData({ ...formData, inseminator_name: e.target.value })}
                placeholder="Nome do inseminador"
              />
            </div>
            {formData.event_type === 'iatf' && (
              <div>
                <Label htmlFor="protocol_day">Dia do Protocolo</Label>
                <Select
                  value={formData.protocol_day || ''}
                  onValueChange={(v) => setFormData({ ...formData, protocol_day: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D-0">D-0</SelectItem>
                    <SelectItem value="D-8">D-8</SelectItem>
                    <SelectItem value="D-9">D-9</SelectItem>
                    <SelectItem value="D-10">D-10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="gnrh_at_ia"
                checked={formData.gnrh_at_ia || false}
                onCheckedChange={(checked) => setFormData({ ...formData, gnrh_at_ia: checked })}
              />
              <Label htmlFor="gnrh_at_ia">GnRH na IA</Label>
            </div>
          </>
        );

      case 'diagnostico':
        return (
          <>
            <div>
              <Label htmlFor="diagnosis_type">Tipo de DG</Label>
              <Select
                value={formData.diagnosis_type || ''}
                onValueChange={(v) => setFormData({ ...formData, diagnosis_type: v as DiagnosisType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dg1">DG 1</SelectItem>
                  <SelectItem value="dg2">DG 2</SelectItem>
                  <SelectItem value="dg3">DG 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="diagnosis_result">Resultado</Label>
              <Select
                value={formData.diagnosis_result || ''}
                onValueChange={(v) => setFormData({ ...formData, diagnosis_result: v as DiagnosisResult })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prenha">Prenha</SelectItem>
                  <SelectItem value="vazia">Vazia</SelectItem>
                  <SelectItem value="perda">Perda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="days_post_ia">Dias pós IA</Label>
              <Input
                id="days_post_ia"
                type="number"
                value={formData.days_post_ia || ''}
                onChange={(e) => setFormData({ ...formData, days_post_ia: parseInt(e.target.value) || undefined })}
              />
            </div>
          </>
        );

      case 'parto':
        return (
          <>
            <div>
              <Label htmlFor="calf_sex">Sexo da Cria</Label>
              <Select
                value={formData.calf_sex || ''}
                onValueChange={(v) => setFormData({ ...formData, calf_sex: v as CalfSex })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="femea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calf_count">Número de Crias</Label>
              <Input
                id="calf_count"
                type="number"
                min="1"
                value={formData.calf_count || 1}
                onChange={(e) => setFormData({ ...formData, calf_count: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="calving_ease">Facilidade de Parto</Label>
              <Select
                value={formData.calving_ease || ''}
                onValueChange={(v) => setFormData({ ...formData, calving_ease: v as CalvingEase })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                  <SelectItem value="cesariana">Cesariana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Table */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title={events.length === 0 ? "Nenhum evento registrado" : "Nenhum evento encontrado"}
          description={events.length === 0 ? "Registre eventos de campo, IA, diagnósticos e mais" : "Tente ajustar os filtros"}
          action={events.length === 0 ? { label: 'Registrar Evento', onClick: openCreateForm } : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {format(new Date(event.event_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.animal?.identification || '—'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
                          {eventTypeLabels[event.event_type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.event_type === 'ia' || event.event_type === 'iatf' ? (
                          <span>{event.bull_name || '—'}</span>
                        ) : event.event_type === 'diagnostico' ? (
                          <span className="capitalize">{event.diagnosis_result || '—'}</span>
                        ) : event.event_type === 'parto' ? (
                          <span className="capitalize">{event.calf_sex || '—'}</span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {event.notes || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo Evento</SheetTitle>
            <SheetDescription>
              Registre um novo evento reprodutivo ou sanitário
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Basic info */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="animal_id">Animal *</Label>
                <Select
                  value={formData.animal_id || ''}
                  onValueChange={(v) => setFormData({ ...formData, animal_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.identification} {animal.name ? `- ${animal.name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event_type">Tipo de Evento *</Label>
                <Select
                  value={formData.event_type || ''}
                  onValueChange={(v) => setFormData({ ...formData, event_type: v as EventType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event_date">Data *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date || ''}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Type-specific fields */}
            <div className="space-y-4">
              {renderEventTypeFields()}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Registrar Evento
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
