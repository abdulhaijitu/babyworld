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
    const UDDOKTAPAY_API_KEY = Deno.env.get('UDDOKTAPAY_API_KEY');
    const UDDOKTAPAY_API_URL = Deno.env.get('UDDOKTAPAY_API_URL') || 'https://sandbox.uddoktapay.com';

    if (!UDDOKTAPAY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'Missing invoice_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment from database first
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoice_id)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call UddoktaPay verify API
    const verifyResponse = await fetch(`${UDDOKTAPAY_API_URL}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY
      },
      body: JSON.stringify({ invoice_id })
    });

    const verifyData = await verifyResponse.json();

    // Update payment status if verification successful
    if (verifyData.status === 'COMPLETED' && payment.status !== 'completed') {
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_method: verifyData.payment_method,
          sender_number: verifyData.sender_number,
          transaction_id: verifyData.transaction_id,
          fee: verifyData.fee ? parseFloat(verifyData.fee) : 0
        })
        .eq('id', payment.id);

      // Update booking payment status
      if (payment.booking_id) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('booking_id', payment.booking_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          ...payment,
          status: verifyData.status === 'COMPLETED' ? 'completed' : payment.status,
          verification: verifyData
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
