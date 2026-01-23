import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { record, type, table } = await req.json();

    console.log(`Received webhook: ${type} on ${table}`, record);

    // Get all admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admin users found');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      type: string;
      entity_type: string;
      entity_id: string;
    }> = [];

    // Handle different event types
    if (table === 'bookings') {
      if (type === 'INSERT') {
        // New booking created
        notifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: 'নতুন বুকিং!',
          message: `${record.parent_name} একটি নতুন বুকিং করেছেন - ${record.slot_date} তারিখে ${record.time_slot}`,
          type: 'success',
          entity_type: 'booking',
          entity_id: record.id,
        }));
      } else if (type === 'UPDATE') {
        // Booking updated
        if (record.status === 'cancelled') {
          notifications = adminRoles.map(admin => ({
            user_id: admin.user_id,
            title: 'বুকিং বাতিল',
            message: `${record.parent_name} এর বুকিং বাতিল হয়েছে`,
            type: 'warning',
            entity_type: 'booking',
            entity_id: record.id,
          }));
        }
      }
    } else if (table === 'payments') {
      if (type === 'INSERT' || (type === 'UPDATE' && record.status === 'completed')) {
        // Payment completed
        notifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: 'পেমেন্ট সম্পন্ন!',
          message: `৳${record.amount} পেমেন্ট সম্পন্ন হয়েছে`,
          type: 'success',
          entity_type: 'payment',
          entity_id: record.id,
        }));
      }
    } else if (table === 'tickets') {
      if (type === 'INSERT') {
        // New ticket issued
        notifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: 'নতুন টিকেট',
          message: `${record.guardian_name} - টিকেট #${record.ticket_number}`,
          type: 'info',
          entity_type: 'ticket',
          entity_id: record.id,
        }));
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        throw insertError;
      }

      console.log(`Created ${notifications.length} notifications`);
    }

    // Log activity
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        action: type.toLowerCase() === 'insert' ? 'create' : 'update',
        entity_type: table === 'bookings' ? 'booking' : table === 'payments' ? 'payment' : 'ticket',
        entity_id: record.id,
        details: {
          event_type: type,
          source: 'webhook',
        }
      });

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    return new Response(
      JSON.stringify({ success: true, notifications_created: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notify-booking:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
