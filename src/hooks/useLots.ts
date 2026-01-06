import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lot } from '@/types/database';

interface UseLotsOptions {
  farmId?: string;
}

export function useLots(options: UseLotsOptions = {}) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLots = useCallback(async () => {
    if (!options.farmId) {
      setLots([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lots')
        .select('*')
        .eq('farm_id', options.farmId)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setLots((data || []) as Lot[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [options.farmId]);

  const createLot = async (name: string, description?: string): Promise<Lot | null> => {
    if (!options.farmId) return null;

    try {
      const { data: newLot, error: createError } = await supabase
        .from('lots')
        .insert({
          farm_id: options.farmId,
          name,
          description,
        })
        .select()
        .single();

      if (createError) throw createError;

      const typedLot = newLot as Lot;
      setLots(prev => [...prev, typedLot].sort((a, b) => a.name.localeCompare(b.name)));
      return typedLot;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const updateLot = async (id: string, data: { name?: string; description?: string }): Promise<Lot | null> => {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('lots')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const typedLot = updated as Lot;
      setLots(prev => prev.map(l => l.id === id ? typedLot : l));
      return typedLot;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const deleteLot = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('lots')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setLots(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  return {
    lots,
    loading,
    error,
    createLot,
    updateLot,
    deleteLot,
    refresh: fetchLots,
  };
}
