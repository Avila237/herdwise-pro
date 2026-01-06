import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventFormData, EventType } from '@/types/database';

interface UseEventsOptions {
  farmId?: string;
  animalId?: string;
  eventType?: EventType;
  startDate?: string;
  endDate?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!options.farmId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select('*, animal:animals(*)')
        .eq('farm_id', options.farmId)
        .order('event_date', { ascending: false });

      if (options.animalId) {
        query = query.eq('animal_id', options.animalId);
      }

      if (options.eventType) {
        query = query.eq('event_type', options.eventType);
      }

      if (options.startDate) {
        query = query.gte('event_date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('event_date', options.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEvents((data || []) as Event[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [options.farmId, options.animalId, options.eventType, options.startDate, options.endDate]);

  const createEvent = async (data: EventFormData): Promise<Event | null> => {
    if (!options.farmId) return null;

    try {
      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert({
          ...data,
          farm_id: options.farmId,
          payload: {},
        })
        .select('*, animal:animals(*)')
        .single();

      if (createError) throw createError;

      const typedEvent = newEvent as Event;
      setEvents(prev => [typedEvent, ...prev]);
      return typedEvent;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const updateEvent = async (id: string, data: Partial<EventFormData>): Promise<Event | null> => {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select('*, animal:animals(*)')
        .single();

      if (updateError) throw updateError;

      const typedEvent = updated as Event;
      setEvents(prev => prev.map(e => e.id === id ? typedEvent : e));
      return typedEvent;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: fetchEvents,
  };
}
