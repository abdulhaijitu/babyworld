import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// This function sends SMS reminders for bookings scheduled for tomorrow
// Should be triggered daily via cron job

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  status: string;
}

async function sendSMS(phone: string, message: string, apiKey: string, senderId: string, apiUrl: string): Promise<boolean> {
  try {
    // Format phone number for Bangladesh
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const smsApiKey = Deno.env.get('SMS_API_KEY');
    const smsSenderId = Deno.env.get('SMS_SENDER_ID');
    const smsApiUrl = Deno.env.get('SMS_API_URL') || 'https://api.revecloud.com/sms/send';

    if (!smsApiKey || !smsSenderId) {
      console.log('SMS credentials not configured, skipping reminders');
      return new Response(
        JSON.stringify({ success: false, message: 'SMS credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking bookings for: ${tomorrowStr}`);

    // Fetch confirmed bookings for tomorrow
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, parent_name, parent_phone, slot_date, time_slot, status')
      .eq('slot_date', tomorrowStr)
      .eq('status', 'confirmed');

    if (error) {
      throw error;
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for tomorrow');
      return new Response(
        JSON.stringify({ success: true, message: 'No bookings for tomorrow', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${bookings.length} bookings for tomorrow`);

    let sentCount = 0;
    let failedCount = 0;

    for (const booking of bookings as Booking[]) {
      const message = `প্রিয় ${booking.parent_name},
রিমাইন্ডার: আপনার Baby World বুকিং আগামীকাল!

📅 তারিখ: ${booking.slot_date}
⏰ সময়: ${booking.time_slot}

আমরা আপনার জন্য অপেক্ষায় আছি! 🎉
📍 Baby World Indoor Playground
📞 +880 1234-567890`;

      const sent = await sendSMS(booking.parent_phone, message, smsApiKey, smsSenderId, smsApiUrl);
      
      if (sent) {
        sentCount++;
        console.log(`Reminder sent to ${booking.parent_phone}`);
        
        // Log the reminder
        await supabase.from('activity_logs').insert({
          entity_type: 'booking',
          entity_id: booking.id,
          action: 'reminder_sent',
          details: { phone: booking.parent_phone, slot_date: booking.slot_date }
        });
      } else {
        failedCount++;
        console.log(`Failed to send reminder to ${booking.parent_phone}`);
      }

      // Small delay between SMS to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reminders processed`,
        total: bookings.length,
        sent: sentCount,
        failed: failedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reminder function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
