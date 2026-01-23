import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface NotificationRequest {
  phone: string;
  message: string;
  channel: 'sms' | 'whatsapp' | 'both';
  reference_id?: string;
  reference_type?: 'ticket' | 'food_order' | 'booking';
  language?: 'en' | 'bn';
}

// Format phone for Bangladesh
function formatPhone(phone: string): string {
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '88' + formatted;
  } else if (!formatted.startsWith('88')) {
    formatted = '88' + formatted;
  }
  return formatted;
}

// Mask phone for logging
function maskPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return phone.slice(0, 3) + '****' + phone.slice(-3);
}

// Send SMS via configured provider
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('SMS_API_KEY');
  const senderId = Deno.env.get('SMS_SENDER_ID');
  const apiUrl = Deno.env.get('SMS_API_URL') || 'https://api.revecloud.com/sms/send';

  if (!apiKey || !senderId) {
    console.log('SMS credentials not configured, skipping SMS');
    return { success: false, error: 'SMS not configured' };
  }

  try {
    const formattedPhone = formatPhone(phone);
    
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
    console.log('SMS API response for', maskPhone(phone), ':', result);
    
    return { success: response.ok };
  } catch (error) {
    console.error('SMS sending error:', error);
    const errorMsg = error instanceof Error ? error.message : 'SMS failed';
    return { success: false, error: errorMsg };
  }
}

// Send WhatsApp via configured provider (Twilio / other)
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioFrom = Deno.env.get('TWILIO_WHATSAPP_FROM');

  // Alternative: UltraMsg or other WhatsApp provider
  const ultramsgToken = Deno.env.get('ULTRAMSG_TOKEN');
  const ultramsgInstance = Deno.env.get('ULTRAMSG_INSTANCE');

  if (ultramsgToken && ultramsgInstance) {
    try {
      const formattedPhone = formatPhone(phone);
      const response = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: ultramsgToken,
          to: formattedPhone,
          body: message
        })
      });

      const result = await response.json();
      console.log('UltraMsg response for', maskPhone(phone), ':', result);
      return { success: result.sent === 'true' || result.sent === true };
    } catch (error) {
      console.error('UltraMsg error:', error);
      const errorMsg = error instanceof Error ? error.message : 'WhatsApp failed';
      return { success: false, error: errorMsg };
    }
  }

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedPhone = formatPhone(phone);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      
      const authHeader = btoa(`${twilioSid}:${twilioToken}`);
      
      const body = new URLSearchParams({
        From: `whatsapp:${twilioFrom}`,
        To: `whatsapp:+${formattedPhone}`,
        Body: message
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const result = await response.json();
      console.log('Twilio WhatsApp response for', maskPhone(phone), ':', result);
      return { success: response.ok };
    } catch (error) {
      console.error('Twilio WhatsApp error:', error);
      const errorMsg = error instanceof Error ? error.message : 'WhatsApp failed';
      return { success: false, error: errorMsg };
    }
  }

  console.log('WhatsApp not configured, skipping');
  return { success: false, error: 'WhatsApp not configured' };
}

// Log notification to database
async function logNotification(
  supabase: ReturnType<typeof createAdminClient>,
  channel: string,
  phone: string,
  message: string,
  status: string,
  referenceId?: string,
  referenceType?: string,
  providerResponse?: unknown,
  errorMessage?: string
) {
  try {
    await supabase.from('notification_logs').insert({
      channel,
      recipient_phone: maskPhone(phone),
      message: message.substring(0, 500),
      status,
      reference_id: referenceId,
      reference_type: referenceType,
      provider_response: providerResponse as Record<string, unknown>,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: NotificationRequest = await req.json();
    const { phone, message, channel, reference_id, reference_type } = body;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate notification (idempotency)
    if (reference_id) {
      const { data: existing } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('reference_id', reference_id)
        .eq('reference_type', reference_type || 'ticket')
        .eq('channel', channel === 'both' ? 'sms' : channel)
        .eq('status', 'sent')
        .maybeSingle();

      if (existing) {
        console.log('Duplicate notification prevented for:', reference_id);
        return new Response(
          JSON.stringify({ success: true, message: 'Notification already sent', duplicate: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const results: { sms?: boolean; whatsapp?: boolean } = {};
    let retryCount = 0;
    const maxRetries = 1;

    // Send SMS
    if (channel === 'sms' || channel === 'both') {
      let smsResult = await sendSMS(phone, message);
      
      // Retry once if failed
      if (!smsResult.success && retryCount < maxRetries) {
        retryCount++;
        console.log('Retrying SMS...');
        smsResult = await sendSMS(phone, message);
      }

      results.sms = smsResult.success;
      await logNotification(
        supabase,
        'sms',
        phone,
        message,
        smsResult.success ? 'sent' : 'failed',
        reference_id,
        reference_type,
        null,
        smsResult.error
      );
    }

    // Send WhatsApp
    if (channel === 'whatsapp' || channel === 'both') {
      const waResult = await sendWhatsApp(phone, message);
      results.whatsapp = waResult.success;
      await logNotification(
        supabase,
        'whatsapp',
        phone,
        message,
        waResult.success ? 'sent' : 'failed',
        reference_id,
        reference_type,
        null,
        waResult.error
      );
    }

    return new Response(
      JSON.stringify({
        success: results.sms || results.whatsapp,
        results,
        message: 'Notification processed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Notification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
