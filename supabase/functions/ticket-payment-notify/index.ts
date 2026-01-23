import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface TicketPaymentRequest {
  ticket_id: string;
  ticket_number: string;
  guardian_name: string;
  guardian_phone: string;
  slot_date: string;
  time_slot?: string;
  total_price: number;
  payment_type: string;
}

// Send notification via edge function
async function sendNotification(
  phone: string,
  message: string,
  channel: 'sms' | 'whatsapp' | 'both',
  referenceId: string
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
        reference_type: 'ticket'
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
}

// Get notification settings
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
    console.error('Failed to get settings:', error);
  }
  return { sms: true, whatsapp: false };
}

// Get message template
async function getMessageTemplate(supabase: ReturnType<typeof createAdminClient>, type: string) {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_templates')
      .maybeSingle();
    
    if (data?.value) {
      const templates = data.value as Record<string, { bn: string; en: string }>;
      return templates[type] || null;
    }
  } catch (error) {
    console.error('Failed to get template:', error);
  }
  return null;
}

// Replace template variables
function replaceVariables(template: string, variables: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: TicketPaymentRequest = await req.json();
    const { 
      ticket_id, 
      ticket_number, 
      guardian_name, 
      guardian_phone, 
      slot_date, 
      time_slot, 
      total_price,
      payment_type 
    } = body;

    if (!ticket_id || !guardian_phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifSettings = await getNotificationSettings(supabase);
    
    // Determine channel
    let channel: 'sms' | 'whatsapp' | 'both' = 'sms';
    if (notifSettings.sms && notifSettings.whatsapp) {
      channel = 'both';
    } else if (notifSettings.whatsapp) {
      channel = 'whatsapp';
    } else if (!notifSettings.sms) {
      // Both disabled
      return new Response(
        JSON.stringify({ success: true, message: 'Notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get custom template or use default
    const template = await getMessageTemplate(supabase, 'ticket_payment');
    
    let message: string;
    if (template) {
      const variables = {
        ticket_number,
        date: slot_date,
        time_slot: time_slot || '',
        total: total_price,
        name: guardian_name
      };
      // Use both languages
      message = replaceVariables(template.bn, variables) + '\n\n' + replaceVariables(template.en, variables);
    } else {
      // Default message
      const timeSlotText = time_slot ? `\nসময়: ${time_slot}` : '';
      const timeSlotTextEn = time_slot ? `\nTime: ${time_slot}` : '';
      
      message = `🎟️ Baby World টিকিট কনফার্ম!
টিকিট: ${ticket_number}
তারিখ: ${slot_date}${timeSlotText}
মোট: ৳${total_price}
ধন্যবাদ ${guardian_name}!

Ticket Confirmed!
ID: ${ticket_number}
Date: ${slot_date}${timeSlotTextEn}
Total: ৳${total_price}`;
    }

    const result = await sendNotification(guardian_phone, message, channel, ticket_id);

    return new Response(
      JSON.stringify({ success: true, notification: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Ticket payment notify error:', error);
    return new Response(
      JSON.stringify({ error: 'Notification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
