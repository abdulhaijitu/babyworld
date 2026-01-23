import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface CancelBookingRequest {
  booking_id: string;
  refund?: boolean;
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: CancelBookingRequest = await req.json();
    const { booking_id, refund = false, reason } = body;

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get booking with payment info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Booking already cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        notes: booking.notes 
          ? `${booking.notes}\n[Cancelled: ${reason || 'No reason provided'}]`
          : `[Cancelled: ${reason || 'No reason provided'}]`
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Booking update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cancel booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Release the slot
    if (booking.slot_id) {
      await supabase
        .from('slots')
        .update({ status: 'available' })
        .eq('id', booking.slot_id);
    }

    // Handle refund if requested and payment was made
    let refundResult = null;
    if (refund && booking.payment_status === 'paid') {
      // Get payment record
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', booking_id)
        .eq('status', 'completed')
        .single();

      if (payment) {
        // Mark as refunded in our system
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              ...payment.metadata,
              refunded_at: new Date().toISOString(),
              refund_reason: reason
            }
          })
          .eq('id', payment.id);

        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded' })
          .eq('id', booking_id);

        refundResult = {
          amount: payment.amount,
          status: 'manual_refund_required',
          message: 'Refund marked. Process manual refund via payment gateway.'
        };
      }
    }

    // Send SMS notification about cancellation
    try {
      const smsMessage = `Baby World বুকিং বাতিল!
তারিখ: ${booking.slot_date}
সময়: ${booking.time_slot}
${refund ? 'রিফান্ড প্রক্রিয়াধীন।' : ''}
ধন্যবাদ।`;
      
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          phone: booking.parent_phone,
          message: smsMessage
        })
      });
    } catch (smsError) {
      console.error('SMS notification failed:', smsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking cancelled successfully',
        refund: refundResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cancel booking error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
