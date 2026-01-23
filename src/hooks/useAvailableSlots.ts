import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Slot {
  id: string;
  time_slot: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
}

interface UseAvailableSlotsReturn {
  slots: Slot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailableSlots(selectedDate: Date | undefined): UseAvailableSlotsReturn {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error: fnError } = await supabase.functions.invoke('get-available-slots', {
        body: { selected_date: dateStr }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch slots');
      }

      if (data?.success && data?.slots) {
        setSlots(data.slots);
      } else {
        throw new Error(data?.error || 'Failed to fetch slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Initial fetch when date changes
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Set up realtime subscription for slot updates
  useEffect(() => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const channel = supabase
      .channel(`slots-${dateStr}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'slots',
          filter: `slot_date=eq.${dateStr}`
        },
        (payload) => {
          // Update the slot in our local state
          setSlots(currentSlots => 
            currentSlots.map(slot => 
              slot.id === payload.new.id 
                ? { ...slot, status: payload.new.status }
                : slot
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return { slots, loading, error, refetch: fetchSlots };
}
