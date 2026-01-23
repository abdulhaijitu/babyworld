import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface CreateMembershipInput {
  member_name: string;
  phone: string;
  child_count: number;
  membership_type: 'monthly' | 'quarterly' | 'yearly';
  discount_percent?: number;
  notes?: string;
  valid_from?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'create';

    if (action === 'create') {
      const body: CreateMembershipInput = await req.json();

      // Validate required fields
      if (!body.member_name || !body.phone || !body.membership_type) {
        return new Response(
          JSON.stringify({ error: 'member_name, phone, and membership_type are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate phone format
      const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
      if (!phoneRegex.test(body.phone.replace(/\s/g, ''))) {
        return new Response(
          JSON.stringify({ error: 'Invalid Bangladesh phone number format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for existing active membership
      const { data: existingMembership } = await supabase
        .from('memberships')
        .select('id, valid_till')
        .eq('phone', body.phone)
        .eq('status', 'active')
        .single();

      if (existingMembership) {
        return new Response(
          JSON.stringify({ 
            error: 'Active membership already exists for this phone number',
            existing_membership_id: existingMembership.id,
            valid_till: existingMembership.valid_till
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate valid_till based on membership type
      const validFrom = body.valid_from ? new Date(body.valid_from) : new Date();
      let validTill = new Date(validFrom);

      switch (body.membership_type) {
        case 'monthly':
          validTill.setMonth(validTill.getMonth() + 1);
          break;
        case 'quarterly':
          validTill.setMonth(validTill.getMonth() + 3);
          break;
        case 'yearly':
          validTill.setFullYear(validTill.getFullYear() + 1);
          break;
      }

      // Create membership
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          member_name: body.member_name,
          phone: body.phone,
          child_count: body.child_count || 1,
          membership_type: body.membership_type,
          discount_percent: body.discount_percent ?? 100,
          valid_from: validFrom.toISOString().split('T')[0],
          valid_till: validTill.toISOString().split('T')[0],
          notes: body.notes,
          status: 'active'
        })
        .select()
        .single();

      if (membershipError) throw membershipError;

      return new Response(
        JSON.stringify({ success: true, membership }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-by-phone') {
      const { phone } = await req.json();

      if (!phone) {
        return new Response(
          JSON.stringify({ error: 'Phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const today = new Date().toISOString().split('T')[0];

      const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'active')
        .gte('valid_till', today)
        .lte('valid_from', today)
        .single();

      return new Response(
        JSON.stringify({ 
          found: !!membership,
          membership: membership || null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate') {
      const { phone, membership_id } = await req.json();

      let query = supabase.from('memberships').select('*');
      
      if (membership_id) {
        query = query.eq('id', membership_id);
      } else if (phone) {
        query = query.eq('phone', phone);
      } else {
        return new Response(
          JSON.stringify({ error: 'phone or membership_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      query = query.eq('status', 'active').gte('valid_till', today);

      const { data: membership } = await query.single();

      if (!membership) {
        return new Response(
          JSON.stringify({ valid: false, reason: 'No active membership found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate remaining days
      const validTill = new Date(membership.valid_till);
      const now = new Date();
      const remainingDays = Math.ceil((validTill.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return new Response(
        JSON.stringify({ 
          valid: true,
          membership: {
            ...membership,
            remaining_days: remainingDays
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update-status') {
      const { membership_id, status } = await req.json();

      if (!membership_id || !status) {
        return new Response(
          JSON.stringify({ error: 'membership_id and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: membership, error } = await supabase
        .from('memberships')
        .update({ status })
        .eq('id', membership_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, membership }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'expire-memberships') {
      // Expire all memberships past their valid_till date
      const today = new Date().toISOString().split('T')[0];

      const { data: expiredMemberships, error } = await supabase
        .from('memberships')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('valid_till', today)
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          expired_count: expiredMemberships?.length || 0,
          expired_memberships: expiredMemberships
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Membership error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to process membership request', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
