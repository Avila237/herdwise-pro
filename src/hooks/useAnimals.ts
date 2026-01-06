import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Animal, AnimalFormData } from '@/types/database';

interface UseAnimalsOptions {
  farmId?: string;
  lotId?: string;
  status?: string;
}

export function useAnimals(options: UseAnimalsOptions = {}) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = useCallback(async () => {
    if (!options.farmId) {
      setAnimals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('animals')
        .select('*, lot:lots(*)')
        .eq('farm_id', options.farmId)
        .eq('is_active', true)
        .order('identification', { ascending: true });

      if (options.lotId) {
        query = query.eq('lot_id', options.lotId);
      }

      if (options.status) {
        query = query.eq('reproductive_status', options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAnimals((data || []) as Animal[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [options.farmId, options.lotId, options.status]);

  const createAnimal = async (data: AnimalFormData): Promise<Animal | null> => {
    if (!options.farmId) return null;

    try {
      const { data: newAnimal, error: createError } = await supabase
        .from('animals')
        .insert({
          ...data,
          farm_id: options.farmId,
        })
        .select('*, lot:lots(*)')
        .single();

      if (createError) throw createError;

      const typedAnimal = newAnimal as Animal;
      setAnimals(prev => [...prev, typedAnimal]);
      return typedAnimal;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const updateAnimal = async (id: string, data: Partial<AnimalFormData>): Promise<Animal | null> => {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('animals')
        .update(data)
        .eq('id', id)
        .select('*, lot:lots(*)')
        .single();

      if (updateError) throw updateError;

      const typedAnimal = updated as Animal;
      setAnimals(prev => prev.map(a => a.id === id ? typedAnimal : a));
      return typedAnimal;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const deleteAnimal = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('animals')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setAnimals(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  return {
    animals,
    loading,
    error,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    refresh: fetchAnimals,
  };
}
