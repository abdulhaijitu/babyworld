import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface GateScanRequest {
  action: 'entry' | 'exit' | 'get_logs';
  ticket_id?: string;
  ticket_number?: string;
  gate_id?: string;
  staff_id?: string;
  staff_name?: string;
  // For get_logs
  filters?: {
    date_from?: string;
    date_to?: string;
    gate_id?: string;
    entry_type?: 'entry' | 'exit';
    ticket_id?: string;
    page?: number;
    limit?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: GateScanRequest = await req.json();
    const { action } = body;

    // Get gate camera config
    const getGateCamera = async (gateId: string) => {
      const { data } = await supabase
        .from('gate_cameras')
        .select('*')
        .eq('gate_id', gateId)
        .single();
      return data;
    };

    // Handle entry scan
    if (action === 'entry') {
      const { ticket_id, ticket_number, gate_id = 'main_gate', staff_id, staff_name } = body;
      
      // Find ticket by ID or number
      let ticketQuery = supabase.from('tickets').select('*');
      if (ticket_id) {
        ticketQuery = ticketQuery.eq('id', ticket_id);
      } else if (ticket_number) {
        ticketQuery = ticketQuery.eq('ticket_number', ticket_number);
      } else {
        return new Response(
          JSON.stringify({ error: 'ticket_id or ticket_number required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: ticket, error: ticketError } = await ticketQuery.single();
      
      if (ticketError || !ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found', code: 'TICKET_NOT_FOUND' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate ticket state
      if (ticket.status === 'cancelled') {
        return new Response(
          JSON.stringify({ error: 'Ticket is cancelled', code: 'TICKET_CANCELLED' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (ticket.status === 'expired') {
        return new Response(
          JSON.stringify({ error: 'Ticket is expired', code: 'TICKET_EXPIRED' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (ticket.inside_venue) {
        return new Response(
          JSON.stringify({ error: 'Guest already inside venue', code: 'ALREADY_INSIDE' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if ticket was already used and exited (re-entry prevention)
      const { data: existingLogs } = await supabase
        .from('gate_logs')
        .select('entry_type')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: false });

      const entryCount = existingLogs?.filter(l => l.entry_type === 'entry').length || 0;
      const exitCount = existingLogs?.filter(l => l.entry_type === 'exit').length || 0;

      // Only allow one entry per ticket (can be configured)
      if (entryCount > 0 && exitCount > 0) {
        return new Response(
          JSON.stringify({ error: 'Ticket already used (entry + exit completed)', code: 'TICKET_COMPLETED' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get camera reference
      const gateCamera = await getGateCamera(gate_id);

      // Create entry log
      const { data: gateLog, error: logError } = await supabase
        .from('gate_logs')
        .insert({
          ticket_id: ticket.id,
          entry_type: 'entry',
          gate_id: gate_id,
          camera_ref: gateCamera?.camera_ref || null,
          scanned_by: staff_id || null,
          scanned_by_name: staff_name || null,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Update ticket status
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          inside_venue: true,
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          action: 'entry',
          log: gateLog,
          ticket: {
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            child_name: ticket.child_name,
            guardian_name: ticket.guardian_name,
          },
          message: 'Entry logged successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle exit scan
    if (action === 'exit') {
      const { ticket_id, ticket_number, gate_id = 'main_gate', staff_id, staff_name } = body;

      // Find ticket
      let ticketQuery = supabase.from('tickets').select('*');
      if (ticket_id) {
        ticketQuery = ticketQuery.eq('id', ticket_id);
      } else if (ticket_number) {
        ticketQuery = ticketQuery.eq('ticket_number', ticket_number);
      } else {
        return new Response(
          JSON.stringify({ error: 'ticket_id or ticket_number required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: ticket, error: ticketError } = await ticketQuery.single();

      if (ticketError || !ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found', code: 'TICKET_NOT_FOUND' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!ticket.inside_venue) {
        return new Response(
          JSON.stringify({ error: 'Guest is not inside venue (no entry recorded)', code: 'NOT_INSIDE' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get camera reference
      const gateCamera = await getGateCamera(gate_id);

      // Create exit log
      const { data: gateLog, error: logError } = await supabase
        .from('gate_logs')
        .insert({
          ticket_id: ticket.id,
          entry_type: 'exit',
          gate_id: gate_id,
          camera_ref: gateCamera?.camera_ref || null,
          scanned_by: staff_id || null,
          scanned_by_name: staff_name || null,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Update ticket - guest is now outside
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ inside_venue: false })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          action: 'exit',
          log: gateLog,
          ticket: {
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            child_name: ticket.child_name,
            guardian_name: ticket.guardian_name,
          },
          message: 'Exit logged successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle get logs
    if (action === 'get_logs') {
      const { filters = {} } = body;
      const { date_from, date_to, gate_id, entry_type, ticket_id, page = 1, limit = 50 } = filters;

      let query = supabase
        .from('gate_logs')
        .select(`
          *,
          tickets (
            ticket_number,
            child_name,
            guardian_name,
            guardian_phone
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (date_from) {
        query = query.gte('created_at', `${date_from}T00:00:00`);
      }
      if (date_to) {
        query = query.lte('created_at', `${date_to}T23:59:59`);
      }
      if (gate_id) {
        query = query.eq('gate_id', gate_id);
      }
      if (entry_type) {
        query = query.eq('entry_type', entry_type);
      }
      if (ticket_id) {
        query = query.eq('ticket_id', ticket_id);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      // Get gate cameras for reference
      const { data: gates } = await supabase.from('gate_cameras').select('*');

      return new Response(
        JSON.stringify({
          success: true,
          logs: logs || [],
          total: count || 0,
          page,
          limit,
          gates: gates || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: entry, exit, or get_logs' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Gate scan error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
