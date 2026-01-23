import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  slot_date: string;
  time_slot: string;
  parent_name: string;
  parent_phone: string;
  booking_type: string;
  ticket_type: string;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

interface UseAdminBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: 'confirmed' | 'pending' | 'cancelled') => Promise<boolean>;
  cancelBooking: (bookingId: string, refund?: boolean, reason?: string) => Promise<any>;
}

// Timeout for data fetching (15 seconds)
const FETCH_TIMEOUT = 15000;

export function useAdminBookings(): UseAdminBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchBookings = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('[AdminBookings] Fetch already in progress, skipping');
      return;
    }

    fetchingRef.current = true;
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), FETCH_TIMEOUT);
    });

    try {
      const fetchPromise = supabase
        .from('bookings')
        .select('*')
        .order('slot_date', { ascending: false })
        .order('time_slot', { ascending: true });

      // Race between fetch and timeout
      const { data, error: fetchError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as Awaited<typeof fetchPromise>;

      if (fetchError) {
        throw fetchError;
      }

      if (mountedRef.current) {
        setBookings((data || []) as Booking[]);
        setError(null);
      }
    } catch (err: any) {
      console.error('[AdminBookings] Error fetching bookings:', err);
      if (mountedRef.current) {
        setError(err.message === 'Request timeout' 
          ? 'Request timed out. Please check your connection and try again.'
          : 'Failed to fetch bookings. Please try again.'
        );
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    status: 'confirmed' | 'pending' | 'cancelled'
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      if (mountedRef.current) {
        setBookings(prev => 
          prev.map(b => b.id === bookingId ? { ...b, status } : b)
        );
      }

      return true;
    } catch (err) {
      console.error('[AdminBookings] Error updating booking:', err);
      return false;
    }
  }, []);

  const cancelBooking = useCallback(async (
    bookingId: string, 
    refund: boolean = false, 
    reason?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: { booking_id: bookingId, refund, reason }
      });

      if (error) {
        throw error;
      }

      // Optimistically update local state
      if (mountedRef.current && data?.success) {
        setBookings(prev => 
          prev.map(b => b.id === bookingId 
            ? { ...b, status: 'cancelled', payment_status: refund ? 'refunded' : b.payment_status } 
            : b
          )
        );
      }

      return data;
    } catch (err) {
      console.error('[AdminBookings] Error cancelling booking:', err);
      return { success: false, error: 'Failed to cancel booking' };
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchBookings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('[AdminBookings] Realtime update:', payload.eventType);
          
          if (!mountedRef.current) return;

          // Handle realtime updates optimistically
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => 
              prev.map(b => b.id === payload.new.id ? payload.new as Booking : b)
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[AdminBookings] Realtime subscription status:', status);
      });

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  return { 
    bookings, 
    loading, 
    error, 
    refetch: fetchBookings, 
    updateBookingStatus, 
    cancelBooking 
  };
}
