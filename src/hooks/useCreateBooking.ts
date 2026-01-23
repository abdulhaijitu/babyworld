import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface BookingData {
  date: Date;
  time_slot: string;
  parent_name: string;
  parent_phone: string;
  child_count?: number;
  notes?: string;
}

export interface BookingResult {
  id: string;
  date: string;
  time_slot: string;
  parent_name: string;
  status: string;
  created_at: string;
}

interface UseCreateBookingReturn {
  createBooking: (data: BookingData) => Promise<BookingResult | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export function useCreateBooking(): UseCreateBookingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createBooking = async (data: BookingData): Promise<BookingResult | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('create-booking', {
        body: {
          date: format(data.date, 'yyyy-MM-dd'),
          time_slot: data.time_slot,
          parent_name: data.parent_name,
          parent_phone: data.parent_phone,
          child_count: data.child_count || 1,
          notes: data.notes
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Booking failed');
      }

      if (result?.success && result?.booking) {
        setSuccess(true);
        return result.booking as BookingResult;
      } else {
        throw new Error(result?.message || result?.error || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { createBooking, loading, error, success, reset };
}
