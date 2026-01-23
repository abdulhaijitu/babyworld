import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

// Send payment notification via edge function
async function sendPaymentNotification(
  phone: string,
  message: string,
  channel: 'sms' | 'whatsapp' | 'both',
  referenceId: string,
  referenceType: 'ticket' | 'food_order' | 'booking'
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        phone,
        message,
        channel,
        reference_id: referenceId,
        reference_type: referenceType
      })
    });

    const result = await response.json();
    console.log('Payment notification result:', result);
    return result;
  } catch (error) {
    console.error('Payment notification error:', error);
    return null;
  }
}

// Get notification settings from database
async function getNotificationSettings(supabase: ReturnType<typeof createAdminClient>) {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_channels')
      .maybeSingle();
    
    if (data?.value) {
      const value = data.value as Record<string, boolean>;
      return {
        sms: value.sms !== false,
        whatsapp: value.whatsapp !== false
      };
    }
  } catch (error) {
    console.error('Failed to get notification settings:', error);
  }
  return { sms: true, whatsapp: false };
}

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

    // Update booking payment status and send notifications
    if (payment.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .update({ payment_status: bookingPaymentStatus })
        .eq('id', payment.booking_id)
        .select()
        .single();

      // Send notifications on successful payment
      if (status === 'COMPLETED' && booking) {
        const notifSettings = await getNotificationSettings(supabase);
        
        // Determine channel based on settings
        let channel: 'sms' | 'whatsapp' | 'both' = 'sms';
        if (notifSettings.sms && notifSettings.whatsapp) {
          channel = 'both';
        } else if (notifSettings.whatsapp) {
          channel = 'whatsapp';
        }

        // Bilingual message
        const smsMessage = `✅ Baby World পেমেন্ট সফল!
৳${amount} | তারিখ: ${booking.slot_date}
সময়: ${booking.time_slot}
ধন্যবাদ ${booking.parent_name}!

Payment Successful!
Amount: ৳${amount}
Date: ${booking.slot_date}
Slot: ${booking.time_slot}`;

        await sendPaymentNotification(
          booking.parent_phone,
          smsMessage,
          channel,
          payment.id,
          'booking'
        );

        console.log('Payment notification sent to:', booking.parent_phone);
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
