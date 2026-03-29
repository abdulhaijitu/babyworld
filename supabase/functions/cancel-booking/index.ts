import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

    // --- Authentication & Authorization ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin/manager/staff role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const allowedRoles = ['admin', 'manager', 'staff', 'super_admin', 'booking_manager'];
    const hasPermission = roles?.some(r => allowedRoles.includes(r.role));

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Input Validation ---
    const body: CancelBookingRequest = await req.json();
    const { booking_id, refund = false, reason } = body;

    if (!booking_id || typeof booking_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(booking_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking ID format' }),
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
    const sanitizedReason = reason ? reason.substring(0, 500) : 'No reason provided';
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        notes: booking.notes 
          ? `${booking.notes}\n[Cancelled by ${user.email}: ${sanitizedReason}]`
          : `[Cancelled by ${user.email}: ${sanitizedReason}]`
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
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', booking_id)
        .eq('status', 'completed')
        .single();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              ...payment.metadata,
              refunded_at: new Date().toISOString(),
              refund_reason: sanitizedReason,
              refunded_by: user.id
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

    // Log the cancellation
    await supabase.from('activity_logs').insert({
      entity_type: 'booking',
      entity_id: booking_id,
      action: 'booking_cancelled',
      user_id: user.id,
      details: { reason: sanitizedReason, refund, refund_result: refundResult }
    });

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
