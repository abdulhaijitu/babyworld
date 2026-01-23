import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface FoodPaymentRequest {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
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
        reference_type: 'food_order'
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
    const body: FoodPaymentRequest = await req.json();
    const { order_id, order_number, customer_name, customer_phone, total, payment_type } = body;

    if (!order_id || !customer_phone) {
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
      return new Response(
        JSON.stringify({ success: true, message: 'Notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get custom template or use default
    const template = await getMessageTemplate(supabase, 'food_order');
    
    let message: string;
    if (template) {
      const variables = {
        order_number,
        total,
        name: customer_name
      };
      message = replaceVariables(template.bn, variables) + '\n\n' + replaceVariables(template.en, variables);
    } else {
      // Default message
      message = `🍔 Baby World ফুড অর্ডার কনফার্ম!
অর্ডার: ${order_number}
মোট: ৳${total}
পেমেন্ট: ${payment_type === 'cash' ? 'ক্যাশ' : 'অনলাইন'}
ধন্যবাদ ${customer_name}!

Food Order Confirmed!
Order: ${order_number}
Total: ৳${total}
Thank you!`;
    }

    const result = await sendNotification(customer_phone, message, channel, order_id);

    return new Response(
      JSON.stringify({ success: true, notification: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Food payment notify error:', error);
    return new Response(
      JSON.stringify({ error: 'Notification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
