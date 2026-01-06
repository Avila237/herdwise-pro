import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { evaluateFormula } from '@/lib/formula-engine';
import type { MetricDefinition, MetricResult, MetricCard, Animal, Event } from '@/types/database';

interface UseMetricsOptions {
  farmId?: string;
  lotId?: string;
  parameters?: Record<string, string | number | boolean>;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [results, setResults] = useState<MetricResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = useCallback(async () => {
    if (!options.farmId) {
      setDefinitions([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('metric_definitions')
        .select('*')
        .or(`farm_id.eq.${options.farmId},farm_id.is.null`)
        .eq('is_current', true)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (fetchError) throw fetchError;

      setDefinitions((data || []) as MetricDefinition[]);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [options.farmId]);

  const calculateMetrics = useCallback(async (
    animals: Animal[],
    events: Event[]
  ): Promise<MetricCard[]> => {
    const cards: MetricCard[] = [];

    for (const def of definitions) {
      try {
        const context = {
          animals: animals.map(a => ({
            ...a,
            // Flatten for formula access
            del: a.current_del,
            dea: a.current_dea,
            status: a.reproductive_status,
            category: a.category,
            parity: a.parity,
          })),
          events: events.map(e => ({
            ...e,
            type: e.event_type,
            date: e.event_date,
          })),
          parameters: options.parameters || {},
        };

        const value = evaluateFormula(def.formula, context);

        let status: 'good' | 'warning' | 'bad' | 'neutral' = 'neutral';
        if (value !== null && def.target_value !== null) {
          if (def.higher_is_better) {
            if (value >= (def.target_value || 0)) status = 'good';
            else if (value >= (def.warning_threshold || 0)) status = 'warning';
            else status = 'bad';
          } else {
            if (value <= (def.target_value || 0)) status = 'good';
            else if (value <= (def.warning_threshold || Infinity)) status = 'warning';
            else status = 'bad';
          }
        }

        cards.push({
          id: def.id,
          name: def.name,
          displayName: def.display_name,
          value: typeof value === 'number' ? value : null,
          unit: def.unit || undefined,
          format: def.format || undefined,
          decimals: def.decimals || undefined,
          targetValue: def.target_value || undefined,
          warningThreshold: def.warning_threshold || undefined,
          criticalThreshold: def.critical_threshold || undefined,
          higherIsBetter: def.higher_is_better,
          status,
        });
      } catch (err) {
        console.error(`Error calculating metric ${def.name}:`, err);
        cards.push({
          id: def.id,
          name: def.name,
          displayName: def.display_name,
          value: null,
          higherIsBetter: def.higher_is_better,
          status: 'neutral',
        });
      }
    }

    return cards;
  }, [definitions, options.parameters]);

  const createDefinition = async (data: Partial<MetricDefinition>): Promise<MetricDefinition | null> => {
    if (!options.farmId) return null;

    try {
      const { data: newDef, error: createError } = await supabase
        .from('metric_definitions')
        .insert({
          farm_id: options.farmId,
          name: data.name || 'new_metric',
          display_name: data.display_name || 'Nova Métrica',
          category: data.category || 'reproductive',
          formula: data.formula || '0',
          unit: data.unit,
          format: data.format,
          decimals: data.decimals,
          target_value: data.target_value,
          warning_threshold: data.warning_threshold,
          critical_threshold: data.critical_threshold,
          higher_is_better: data.higher_is_better ?? true,
          scope: data.scope || 'farm',
          version: 1,
          is_current: true,
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      const typedDef = newDef as MetricDefinition;
      setDefinitions(prev => [...prev, typedDef]);
      return typedDef;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const updateDefinition = async (
    id: string,
    data: Partial<MetricDefinition>
  ): Promise<MetricDefinition | null> => {
    try {
      // Get current definition
      const current = definitions.find(d => d.id === id);
      if (!current) return null;

      // If formula changed, create new version
      if (data.formula && data.formula !== current.formula) {
        // Mark current as not current
        await supabase
          .from('metric_definitions')
          .update({ is_current: false })
          .eq('id', id);

        // Create new version
        const { data: newDef, error: createError } = await supabase
          .from('metric_definitions')
          .insert({
            ...current,
            ...data,
            id: undefined,
            version: current.version + 1,
            is_current: true,
            created_at: undefined,
            updated_at: undefined,
          })
          .select()
          .single();

        if (createError) throw createError;

        const typedDef = newDef as MetricDefinition;
        setDefinitions(prev => prev.map(d => d.id === id ? typedDef : d));
        return typedDef;
      }

      // Otherwise, just update
      const { data: updated, error: updateError } = await supabase
        .from('metric_definitions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const typedDef = updated as MetricDefinition;
      setDefinitions(prev => prev.map(d => d.id === id ? typedDef : d));
      return typedDef;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDefinitions();
      setLoading(false);
    };
    init();
  }, [fetchDefinitions]);

  return {
    definitions,
    results,
    loading,
    error,
    calculateMetrics,
    createDefinition,
    updateDefinition,
    refresh: fetchDefinitions,
  };
}
