import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface PaymentRequest {
  booking_id: string;
  amount: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  redirect_url: string;
  cancel_url: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const UDDOKTAPAY_API_KEY = Deno.env.get('UDDOKTAPAY_API_KEY');
    const UDDOKTAPAY_API_URL = Deno.env.get('UDDOKTAPAY_API_URL') || 'https://sandbox.uddoktapay.com/api/checkout-v2';

    if (!UDDOKTAPAY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PaymentRequest = await req.json();
    const { booking_id, amount, customer_name, customer_email, customer_phone, redirect_url, cancel_url } = body;

    // Validate required fields
    if (!booking_id || !amount || !customer_name || !customer_phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify booking exists
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

    // Generate unique invoice ID
    const invoiceId = `BW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Get webhook URL from Supabase project URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;

    // Prepare UddoktaPay checkout request
    const paymentPayload = {
      full_name: customer_name,
      email: customer_email || `${customer_phone}@placeholder.com`,
      amount: amount.toString(),
      metadata: {
        booking_id,
        invoice_id: invoiceId
      },
      redirect_url,
      cancel_url,
      webhook_url: webhookUrl
    };

    // Call UddoktaPay API
    const uddoktaResponse = await fetch(UDDOKTAPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY
      },
      body: JSON.stringify(paymentPayload)
    });

    const uddoktaData = await uddoktaResponse.json();

    if (!uddoktaResponse.ok || !uddoktaData.payment_url) {
      console.error('UddoktaPay error:', uddoktaData);
      return new Response(
        JSON.stringify({ error: 'Payment initiation failed', details: uddoktaData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        invoice_id: invoiceId,
        amount,
        currency: 'BDT',
        status: 'pending',
        metadata: {
          uddokta_response: uddoktaData,
          customer_phone
        }
      });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'pending' })
      .eq('id', booking_id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: uddoktaData.payment_url,
        invoice_id: invoiceId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
