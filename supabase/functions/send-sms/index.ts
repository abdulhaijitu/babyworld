import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface SMSRequest {
  phone: string;
  message: string;
}

// Reve Systems / Khudebarta SMS API
async function sendSMS(phone: string, message: string): Promise<boolean> {
  const apiKey = Deno.env.get('SMS_API_KEY');
  const senderId = Deno.env.get('SMS_SENDER_ID');
  const apiUrl = Deno.env.get('SMS_API_URL') || 'https://api.revecloud.com/sms/send';

  if (!apiKey || !senderId) {
    console.error('SMS credentials not configured');
    return false;
  }

  try {
    // Format phone number for Bangladesh (remove leading 0, add 88)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '88' + formattedPhone;
    } else if (!formattedPhone.startsWith('88')) {
      formattedPhone = '88' + formattedPhone;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        api_key: apiKey,
        sender_id: senderId,
        to: formattedPhone,
        message: message,
        type: 'text'
      })
    });

    const result = await response.json();
    console.log('SMS API response:', result);
    
    return response.ok;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SMSRequest = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sent = await sendSMS(phone, message);

    return new Response(
      JSON.stringify({ 
        success: sent,
        message: sent ? 'SMS sent successfully' : 'SMS sending failed (credentials may not be configured)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
