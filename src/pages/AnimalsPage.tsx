import { useState } from 'react';
import { useFarmContext } from '@/hooks/useFarm';
import { useAnimals } from '@/hooks/useAnimals';
import { useLots } from '@/hooks/useLots';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, Edit, Trash2, Beef, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Animal, AnimalFormData, AnimalCategory, ReproductiveStatus, ProductiveStatus, AnimalParity } from '@/types/database';
import { format } from 'date-fns';

const initialFormData: AnimalFormData = {
  identification: '',
  name: '',
  category: 'vaca',
  reproductive_status: 'vazia',
  productive_status: 'lactacao',
};

export default function AnimalsPage() {
  const { toast } = useToast();
  const { currentFarm, loading: farmLoading } = useFarmContext();
  const { animals, loading, error, createAnimal, updateAnimal, deleteAnimal, refresh } = useAnimals({
    farmId: currentFarm?.id,
  });
  const { lots } = useLots({ farmId: currentFarm?.id });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState<AnimalFormData>(initialFormData);

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = animal.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.ear_tag?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || animal.reproductive_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || animal.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCreateForm = () => {
    setEditingAnimal(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      identification: animal.identification,
      name: animal.name || '',
      ear_tag: animal.ear_tag || '',
      electronic_tag: animal.electronic_tag || '',
      father_name: animal.father_name || '',
      mother_name: animal.mother_name || '',
      grandfather_name: animal.grandfather_name || '',
      great_grandfather_name: animal.great_grandfather_name || '',
      birth_date: animal.birth_date || '',
      first_calving_date: animal.first_calving_date || '',
      last_calving_date: animal.last_calving_date || '',
      category: animal.category,
      parity: animal.parity,
      reproductive_status: animal.reproductive_status,
      productive_status: animal.productive_status,
      lot_id: animal.lot_id || '',
      notes: animal.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identification.trim()) {
      toast({
        title: 'Erro',
        description: 'Identificação é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAnimal) {
        await updateAnimal(editingAnimal.id, formData);
        toast({ title: 'Animal atualizado com sucesso' });
      } else {
        await createAnimal(formData);
        toast({ title: 'Animal cadastrado com sucesso' });
      }
      setIsFormOpen(false);
      setFormData(initialFormData);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o animal',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (animal: Animal) => {
    if (!confirm(`Deseja realmente excluir o animal ${animal.identification}?`)) return;
    
    const success = await deleteAnimal(animal.id);
    if (success) {
      toast({ title: 'Animal excluído com sucesso' });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o animal',
        variant: 'destructive',
      });
    }
  };

  if (farmLoading || loading) {
    return <LoadingPage message="Carregando animais..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!currentFarm) {
    return (
      <EmptyState
        icon={<Beef className="w-8 h-8" />}
        title="Nenhuma fazenda selecionada"
        description="Selecione uma fazenda para ver os animais"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="prenha">Prenhas</SelectItem>
              <SelectItem value="inseminada">Inseminadas</SelectItem>
              <SelectItem value="vazia">Vazias</SelectItem>
              <SelectItem value="seca">Secas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="vaca">Vacas</SelectItem>
              <SelectItem value="novilha">Novilhas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Animal
        </Button>
      </div>

      {/* Table */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon={<Beef className="w-8 h-8" />}
          title={animals.length === 0 ? "Nenhum animal cadastrado" : "Nenhum animal encontrado"}
          description={animals.length === 0 ? "Comece cadastrando os animais do rebanho" : "Tente ajustar os filtros de busca"}
          action={animals.length === 0 ? { label: 'Cadastrar Animal', onClick: openCreateForm } : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>DEL</TableHead>
                    <TableHead>DEA</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.identification}</TableCell>
                      <TableCell>{animal.name || '—'}</TableCell>
                      <TableCell className="capitalize">{animal.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={animal.reproductive_status} />
                      </TableCell>
                      <TableCell>{animal.lot?.name || '—'}</TableCell>
                      <TableCell>{animal.current_del ?? '—'}</TableCell>
                      <TableCell>{animal.current_dea ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(animal)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(animal)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
            <SheetTitle>
              {editingAnimal ? 'Editar Animal' : 'Novo Animal'}
            </SheetTitle>
            <SheetDescription>
              Preencha os dados do animal
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Identification */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Identificação
              </h4>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="identification">Matriz N° *</Label>
                  <Input
                    id="identification"
                    value={formData.identification}
                    onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                    placeholder="Ex: 001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mimosa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ear_tag">Brinco</Label>
                    <Input
                      id="ear_tag"
                      value={formData.ear_tag || ''}
                      onChange={(e) => setFormData({ ...formData, ear_tag: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="electronic_tag">Tag Eletrônico</Label>
                    <Input
                      id="electronic_tag"
                      value={formData.electronic_tag || ''}
                      onChange={(e) => setFormData({ ...formData, electronic_tag: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Categoria e Status
              </h4>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as AnimalCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaca">Vaca</SelectItem>
                        <SelectItem value="novilha">Novilha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parity">Paridade</Label>
                    <Select
                      value={formData.parity || ''}
                      onValueChange={(v) => setFormData({ ...formData, parity: v as AnimalParity })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primipara">Primípara</SelectItem>
                        <SelectItem value="multipara">Multípara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reproductive_status">Status Reprodutivo</Label>
                    <Select
                      value={formData.reproductive_status}
                      onValueChange={(v) => setFormData({ ...formData, reproductive_status: v as ReproductiveStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vazia">Vazia</SelectItem>
                        <SelectItem value="inseminada">Inseminada</SelectItem>
                        <SelectItem value="prenha">Prenha</SelectItem>
                        <SelectItem value="seca">Seca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="productive_status">Status Produtivo</Label>
                    <Select
                      value={formData.productive_status}
                      onValueChange={(v) => setFormData({ ...formData, productive_status: v as ProductiveStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lactacao">Lactação</SelectItem>
                        <SelectItem value="seca">Seca</SelectItem>
                        <SelectItem value="descartada">Descartada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="lot_id">Lote</Label>
                  <Select
                    value={formData.lot_id || ''}
                    onValueChange={(v) => setFormData({ ...formData, lot_id: v || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {lots.map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          {lot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Datas
              </h4>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_calving_date">1° Parto</Label>
                    <Input
                      id="first_calving_date"
                      type="date"
                      value={formData.first_calving_date || ''}
                      onChange={(e) => setFormData({ ...formData, first_calving_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_calving_date">Último Parto</Label>
                    <Input
                      id="last_calving_date"
                      type="date"
                      value={formData.last_calving_date || ''}
                      onChange={(e) => setFormData({ ...formData, last_calving_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Genealogy */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Genealogia
              </h4>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="father_name">Pai</Label>
                    <Input
                      id="father_name"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mother_name">Mãe</Label>
                    <Input
                      id="mother_name"
                      value={formData.mother_name || ''}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grandfather_name">Avô</Label>
                    <Input
                      id="grandfather_name"
                      value={formData.grandfather_name || ''}
                      onChange={(e) => setFormData({ ...formData, grandfather_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="great_grandfather_name">Bisavô</Label>
                    <Input
                      id="great_grandfather_name"
                      value={formData.great_grandfather_name || ''}
                      onChange={(e) => setFormData({ ...formData, great_grandfather_name: e.target.value })}
                    />
                  </div>
                </div>
              </div>
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
                {editingAnimal ? 'Salvar Alterações' : 'Cadastrar Animal'}
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
