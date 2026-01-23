import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const { ticket_id, ticket_number } = await req.json();

    if (!ticket_id && !ticket_number) {
      return new Response(
        JSON.stringify({ error: 'ticket_id or ticket_number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ticket
    let query = supabase.from('tickets').select('*');
    
    if (ticket_id) {
      query = query.eq('id', ticket_id);
    } else {
      query = query.eq('ticket_number', ticket_number);
    }

    const { data: ticket, error: ticketError } = await query.single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Ticket not found',
          code: 'NOT_FOUND'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const ticketDate = new Date(ticket.slot_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);

    // Check if ticket is for today
    if (ticketDate.getTime() !== today.getTime()) {
      const isPast = ticketDate < today;
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: isPast ? 'Ticket date has passed' : 'Ticket is for a future date',
          code: isPast ? 'DATE_PASSED' : 'FUTURE_DATE',
          ticket_date: ticket.slot_date
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check ticket status
    if (ticket.status === 'cancelled') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Ticket has been cancelled',
          code: 'CANCELLED'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (ticket.status === 'expired') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Ticket has expired',
          code: 'EXPIRED'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (ticket.status === 'used') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Ticket has already been used',
          code: 'ALREADY_USED',
          used_at: ticket.used_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check out_time if set (for counter tickets)
    if (ticket.out_time) {
      const outTime = new Date(ticket.out_time);
      if (now > outTime) {
        // Mark ticket as expired
        await supabase
          .from('tickets')
          .update({ status: 'expired' })
          .eq('id', ticket.id);

        return new Response(
          JSON.stringify({ 
            valid: false, 
            reason: 'Ticket time has expired',
            code: 'TIME_EXPIRED',
            out_time: ticket.out_time
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Ticket is valid
    return new Response(
      JSON.stringify({ 
        valid: true,
        ticket: {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          guardian_name: ticket.guardian_name,
          guardian_phone: ticket.guardian_phone,
          slot_date: ticket.slot_date,
          in_time: ticket.in_time,
          out_time: ticket.out_time,
          status: ticket.status,
          inside_venue: ticket.inside_venue
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validate ticket time error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to validate ticket', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
