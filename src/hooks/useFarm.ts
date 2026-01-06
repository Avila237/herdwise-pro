import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Farm } from '@/types/database';

interface FarmContextType {
  currentFarm: Farm | null;
  farms: Farm[];
  loading: boolean;
  error: string | null;
  setCurrentFarm: (farm: Farm | null) => void;
  createFarm: (name: string, location?: string) => Promise<Farm | null>;
  refreshFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function useFarmContext() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarmContext must be used within FarmProvider');
  }
  return context;
}

export function useFarm() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      const typedData = (data || []) as Farm[];
      setFarms(typedData);
      
      // Auto-select first farm if none selected
      if (!currentFarm && typedData.length > 0) {
        setCurrentFarm(typedData[0]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createFarm = async (name: string, location?: string): Promise<Farm | null> => {
    try {
      const { data, error: createError } = await supabase
        .from('farms')
        .insert({ name, location })
        .select()
        .single();
      
      if (createError) throw createError;
      
      const newFarm = data as Farm;
      setFarms(prev => [newFarm, ...prev]);
      setCurrentFarm(newFarm);
      
      return newFarm;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  return {
    farms,
    currentFarm,
    loading,
    error,
    setCurrentFarm,
    createFarm,
    refreshFarms: fetchFarms,
  };
}

export { FarmContext };
export type { FarmContextType };
