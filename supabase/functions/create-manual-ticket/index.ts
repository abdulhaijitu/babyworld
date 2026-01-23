import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface ManualTicketInput {
  date: string;
  guardian_count: number;
  child_count: number;
  socks_count: number;
  rides: { ride_id: string; quantity: number }[];
  phone: string;
  guardian_name?: string;
  notes?: string;
  payment_type: 'cash' | 'online';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: ManualTicketInput = await req.json();

    // Validate required fields
    if (!body.phone || !body.date) {
      return new Response(
        JSON.stringify({ error: 'Phone and date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Bangladesh phone format
    const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (!phoneRegex.test(body.phone.replace(/\s/g, ''))) {
      return new Response(
        JSON.stringify({ error: 'Invalid Bangladesh phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date is not in the past
    const ticketDate = new Date(body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (ticketDate < today) {
      return new Response(
        JSON.stringify({ error: 'Cannot create ticket for past date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch pricing settings
    const { data: pricingSettings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ticket_pricing')
      .single();

    const pricing = pricingSettings?.value || {
      entry_price: 500,
      extra_guardian_price: 100,
      extra_child_price: 200,
      socks_price: 50
    };

    // Check for active membership
    let membershipDiscount = 0;
    let membershipId = null;
    
    const { data: membership } = await supabase
      .from('memberships')
      .select('*')
      .eq('phone', body.phone)
      .eq('status', 'active')
      .gte('valid_till', body.date)
      .lte('valid_from', body.date)
      .single();

    if (membership) {
      membershipDiscount = membership.discount_percent;
      membershipId = membership.id;
    }

    // Calculate prices
    const guardianCount = Math.max(1, body.guardian_count || 1);
    const childCount = Math.max(1, body.child_count || 1);
    const socksCount = body.socks_count || 0;

    // Entry price (1 guardian + 1 child base)
    let entryPrice = pricing.entry_price;
    
    // Extra guardians (beyond first)
    if (guardianCount > 1) {
      entryPrice += (guardianCount - 1) * pricing.extra_guardian_price;
    }
    
    // Extra children (beyond first)
    if (childCount > 1) {
      entryPrice += (childCount - 1) * pricing.extra_child_price;
    }

    // Socks price
    const socksPrice = socksCount * pricing.socks_price;

    // Calculate rides price
    let ridesPrice = 0;
    const rideDetails: { ride_id: string; quantity: number; unit_price: number; total_price: number }[] = [];

    if (body.rides && body.rides.length > 0) {
      const rideIds = body.rides.map(r => r.ride_id);
      const { data: rides } = await supabase
        .from('rides')
        .select('id, price')
        .in('id', rideIds)
        .eq('is_active', true);

      if (rides) {
        for (const selectedRide of body.rides) {
          const ride = rides.find(r => r.id === selectedRide.ride_id);
          if (ride) {
            const quantity = selectedRide.quantity || 1;
            const totalRidePrice = Number(ride.price) * quantity;
            ridesPrice += totalRidePrice;
            rideDetails.push({
              ride_id: ride.id,
              quantity,
              unit_price: Number(ride.price),
              total_price: totalRidePrice
            });
          }
        }
      }
    }

    // Calculate total before discount
    const subtotal = entryPrice + socksPrice + ridesPrice;
    
    // Apply membership discount (only on entry price)
    const discountAmount = membershipDiscount > 0 ? (entryPrice * membershipDiscount / 100) : 0;
    const totalPrice = subtotal - discountAmount;

    // Set times
    const inTime = new Date();
    const outTime = new Date(inTime.getTime() + 60 * 60 * 1000); // +1 hour

    // Generate ticket number
    const ticketNumber = `TK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        ticket_number: ticketNumber,
        slot_date: body.date,
        guardian_name: body.guardian_name || 'Walk-in Customer',
        guardian_phone: body.phone,
        guardian_count: guardianCount,
        child_count: childCount,
        socks_count: socksCount,
        socks_price: socksPrice,
        entry_price: entryPrice,
        addons_price: ridesPrice,
        total_price: totalPrice,
        discount_applied: discountAmount,
        payment_type: body.payment_type,
        payment_status: body.payment_type === 'cash' ? 'paid' : 'pending',
        source: 'physical',
        status: 'active',
        ticket_type: 'hourly_play',
        in_time: inTime.toISOString(),
        out_time: outTime.toISOString(),
        membership_id: membershipId,
        notes: body.notes
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Insert ride records
    if (rideDetails.length > 0 && ticket) {
      const rideInserts = rideDetails.map(rd => ({
        ticket_id: ticket.id,
        ride_id: rd.ride_id,
        quantity: rd.quantity,
        unit_price: rd.unit_price,
        total_price: rd.total_price
      }));

      await supabase.from('ticket_rides').insert(rideInserts);
    }

    // Return ticket with breakdown
    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          ...ticket,
          price_breakdown: {
            entry_price: entryPrice,
            socks_price: socksPrice,
            rides_price: ridesPrice,
            subtotal,
            discount_amount: discountAmount,
            membership_applied: membershipId !== null,
            total: totalPrice
          },
          rides: rideDetails
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create manual ticket error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to create ticket', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
