import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    
    // Parse webhook data
    const webhookData = await req.json();
    console.log('Payment webhook received:', webhookData);

    const {
      status,
      full_name,
      email,
      amount,
      fee,
      charged_amount,
      invoice_id,
      payment_method,
      sender_number,
      transaction_id,
      date,
      metadata
    } = webhookData;

    // Get invoice_id from metadata if not at top level
    const actualInvoiceId = invoice_id || metadata?.invoice_id;

    if (!actualInvoiceId) {
      console.error('No invoice_id in webhook data');
      return new Response(
        JSON.stringify({ error: 'Missing invoice_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, booking_id')
      .eq('invoice_id', actualInvoiceId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', actualInvoiceId);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map UddoktaPay status to our status
    let paymentStatus = 'pending';
    let bookingPaymentStatus = 'pending';

    if (status === 'COMPLETED') {
      paymentStatus = 'completed';
      bookingPaymentStatus = 'paid';
    } else if (status === 'CANCELLED' || status === 'FAILED') {
      paymentStatus = 'failed';
      bookingPaymentStatus = 'failed';
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        payment_method,
        sender_number,
        transaction_id,
        fee: fee ? parseFloat(fee) : 0,
        metadata: {
          ...payment.metadata,
          webhook_data: webhookData,
          completed_at: date
        }
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
    }

    // Update booking payment status and send SMS
    if (payment.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .update({ payment_status: bookingPaymentStatus })
        .eq('id', payment.booking_id)
        .select()
        .single();

      // Send SMS on successful payment
      if (status === 'COMPLETED' && booking) {
        try {
          const smsMessage = `Baby World পেমেন্ট সফল! ৳${amount}
তারিখ: ${booking.slot_date}
সময়: ${booking.time_slot}
ট্রান্সাকশন: ${transaction_id || 'N/A'}
ধন্যবাদ ${booking.parent_name}!`;
          
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
          console.log('Payment SMS sent to:', booking.parent_phone);
        } catch (smsError) {
          console.error('Payment SMS failed:', smsError);
        }
      }
    }

    console.log(`Payment ${actualInvoiceId} updated to ${paymentStatus}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
