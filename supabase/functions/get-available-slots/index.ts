import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

// Default time slots configuration (10:00 AM to 9:00 PM)
const DEFAULT_SLOTS = [
  { time_slot: '10:00 - 11:00', start_time: '10:00:00', end_time: '11:00:00' },
  { time_slot: '11:00 - 12:00', start_time: '11:00:00', end_time: '12:00:00' },
  { time_slot: '12:00 - 13:00', start_time: '12:00:00', end_time: '13:00:00' },
  { time_slot: '13:00 - 14:00', start_time: '13:00:00', end_time: '14:00:00' },
  { time_slot: '14:00 - 15:00', start_time: '14:00:00', end_time: '15:00:00' },
  { time_slot: '15:00 - 16:00', start_time: '15:00:00', end_time: '16:00:00' },
  { time_slot: '16:00 - 17:00', start_time: '16:00:00', end_time: '17:00:00' },
  { time_slot: '17:00 - 18:00', start_time: '17:00:00', end_time: '18:00:00' },
  { time_slot: '18:00 - 19:00', start_time: '18:00:00', end_time: '19:00:00' },
  { time_slot: '19:00 - 20:00', start_time: '19:00:00', end_time: '20:00:00' },
  { time_slot: '20:00 - 21:00', start_time: '20:00:00', end_time: '21:00:00' },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    
    // Parse request body
    const { selected_date } = await req.json();
    
    if (!selected_date) {
      return new Response(
        JSON.stringify({ error: 'selected_date is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selected_date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if slots exist for this date
    const { data: existingSlots, error: fetchError } = await supabase
      .from('slots')
      .select('*')
      .eq('slot_date', selected_date)
      .order('start_time', { ascending: true });

    if (fetchError) {
      console.error('Error fetching slots:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch slots' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no slots exist for this date, auto-generate them
    if (!existingSlots || existingSlots.length === 0) {
      const slotsToInsert = DEFAULT_SLOTS.map(slot => ({
        slot_date: selected_date,
        time_slot: slot.time_slot,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: 'available'
      }));

      const { data: insertedSlots, error: insertError } = await supabase
        .from('slots')
        .insert(slotsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting slots:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate slots' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          date: selected_date,
          slots: insertedSlots.map(s => ({
            id: s.id,
            time_slot: s.time_slot,
            start_time: s.start_time,
            end_time: s.end_time,
            status: s.status
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return existing slots
    return new Response(
      JSON.stringify({ 
        success: true, 
        date: selected_date,
        slots: existingSlots.map(s => ({
          id: s.id,
          time_slot: s.time_slot,
          start_time: s.start_time,
          end_time: s.end_time,
          status: s.status
        }))
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
