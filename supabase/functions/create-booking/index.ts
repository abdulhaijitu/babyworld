import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface BookingRequest {
  date: string;
  time_slot: string;
  parent_name: string;
  parent_phone: string;
  child_count?: number;
  notes?: string;
}

// Validation helpers
function validatePhone(phone: string): boolean {
  // Accept any 11+ digit phone number (flexible validation)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    
    // Parse and validate request body
    const body: BookingRequest = await req.json();
    const { date, time_slot, parent_name, parent_phone, child_count = 1, notes } = body;

    // Validate required fields
    if (!date || !time_slot || !parent_name || !parent_phone) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          message: 'Please provide date, time_slot, parent_name, and parent_phone'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize inputs
    const cleanName = sanitizeInput(parent_name);
    const cleanPhone = parent_phone.replace(/[\s\-+]/g, '');
    
    if (!validateName(cleanName)) {
      return new Response(
        JSON.stringify({ error: 'Invalid name. Must be 2-100 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePhone(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number. Use Bangladesh format (01XXXXXXXXX)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if slot exists and is available (using a transaction-like approach)
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('*')
      .eq('slot_date', date)
      .eq('time_slot', time_slot)
      .single();

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ 
          error: 'Slot not found',
          message: 'The requested time slot does not exist for this date'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if slot is already booked
    if (slot.status === 'booked') {
      return new Response(
        JSON.stringify({ 
          error: 'Slot no longer available',
          message: 'This slot has already been booked. Please select another time.'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update slot status to booked FIRST (to prevent race conditions)
    const { error: updateError } = await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', slot.id)
      .eq('status', 'available'); // Only update if still available

    if (updateError) {
      console.error('Error updating slot:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Slot no longer available',
          message: 'This slot was just booked by another user. Please select another time.'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slot.id,
        slot_date: date,
        time_slot: time_slot,
        parent_name: cleanName,
        parent_phone: cleanPhone,
        booking_type: 'hourly_play',
        ticket_type: 'child_guardian',
        status: 'confirmed',
        notes: notes ? sanitizeInput(notes.substring(0, 500)) : null
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      
      // Rollback slot status on booking failure
      await supabase
        .from('slots')
        .update({ status: 'available' })
        .eq('id', slot.id);

      return new Response(
        JSON.stringify({ 
          error: 'Booking failed',
          message: 'Could not complete your booking. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS notification (non-blocking)
    try {
      const smsMessage = `Baby World বুকিং কনফার্ম! 
তারিখ: ${date}
সময়: ${time_slot}
ধন্যবাদ ${cleanName}!`;
      
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          phone: cleanPhone,
          message: smsMessage
        })
      });
    } catch (smsError) {
      console.error('SMS notification failed:', smsError);
      // Don't fail the booking if SMS fails
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Booking confirmed successfully!',
        booking: {
          id: booking.id,
          date: booking.slot_date,
          time_slot: booking.time_slot,
          parent_name: booking.parent_name,
          status: booking.status,
          created_at: booking.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        message: 'Please try again later'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
