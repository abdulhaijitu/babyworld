import { useState, useEffect } from 'react';
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

export function useAdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('slot_date', { ascending: false })
        .order('time_slot', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setBookings((data || []) as Booking[]);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (updateError) {
        throw updateError;
      }

      // Refresh bookings
      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Error updating booking:', err);
      return false;
    }
  };

  const cancelBooking = async (bookingId: string, refund: boolean = false, reason?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: { booking_id: bookingId, refund, reason }
      });

      if (error) throw error;

      await fetchBookings();
      return data;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { bookings, loading, error, refetch: fetchBookings, updateBookingStatus, cancelBooking };
}
