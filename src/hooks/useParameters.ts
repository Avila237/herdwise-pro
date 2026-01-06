import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Parameter, ParameterType } from '@/types/database';

interface UseParametersOptions {
  farmId?: string;
  currentOnly?: boolean;
}

export function useParameters(options: UseParametersOptions = {}) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParameters = useCallback(async () => {
    if (!options.farmId) {
      setParameters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('parameters')
        .select('*')
        .eq('farm_id', options.farmId)
        .order('name', { ascending: true });

      if (options.currentOnly !== false) {
        query = query.eq('is_current', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setParameters((data || []) as Parameter[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [options.farmId, options.currentOnly]);

  const setParameter = async (
    name: string,
    value: string,
    valueType: ParameterType = 'number',
    description?: string
  ): Promise<Parameter | null> => {
    if (!options.farmId) return null;

    try {
      // First, mark existing parameter as not current
      await supabase
        .from('parameters')
        .update({ is_current: false })
        .eq('farm_id', options.farmId)
        .eq('name', name)
        .eq('is_current', true);

      // Get max version
      const { data: existing } = await supabase
        .from('parameters')
        .select('version')
        .eq('farm_id', options.farmId)
        .eq('name', name)
        .order('version', { ascending: false })
        .limit(1);

      const newVersion = (existing?.[0]?.version || 0) + 1;

      // Create new version
      const { data: newParam, error: createError } = await supabase
        .from('parameters')
        .insert({
          farm_id: options.farmId,
          name,
          value,
          value_type: valueType,
          description,
          version: newVersion,
          is_current: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      const typedParam = newParam as Parameter;
      setParameters(prev => {
        const filtered = prev.filter(p => p.name !== name);
        return [...filtered, typedParam].sort((a, b) => a.name.localeCompare(b.name));
      });

      return typedParam;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const getParameterValue = (name: string): string | number | boolean | null => {
    const param = parameters.find(p => p.name === name && p.is_current);
    if (!param) return null;

    switch (param.value_type) {
      case 'number':
        return parseFloat(param.value);
      case 'boolean':
        return param.value === 'true';
      default:
        return param.value;
    }
  };

  const getParametersMap = (): Record<string, string | number | boolean> => {
    const map: Record<string, string | number | boolean> = {};
    parameters.forEach(param => {
      if (param.is_current) {
        const value = getParameterValue(param.name);
        if (value !== null) {
          map[param.name] = value;
        }
      }
    });
    return map;
  };

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  return {
    parameters,
    loading,
    error,
    setParameter,
    getParameterValue,
    getParametersMap,
    refresh: fetchParameters,
  };
}
