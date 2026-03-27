import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

type AppRole = 'super_admin' | 'admin' | 'management' | 'manager' | 'sales_marketing' | 'ticket_counterman' | 'gateman' | 'food_manager' | 'food_staff' | 'booking_manager' | 'accountant' | 'hr_manager' | 'staff';

interface CreateUserRequest {
  email: string;
  password: string;
  role: AppRole;
}

const validRoles: AppRole[] = [
  'super_admin', 'admin', 'management', 'manager', 'sales_marketing',
  'ticket_counterman', 'gateman', 'food_manager', 'food_staff',
  'booking_manager', 'accountant', 'hr_manager', 'staff'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: CreateUserRequest = await req.json();
    const { email, password, role = 'staff' } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role: ${role}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: role
      });

    if (roleError) {
      console.error('Role error:', roleError);
      return new Response(
        JSON.stringify({ 
          error: `User created but failed to assign ${role} role`,
          user_id: authData.user.id 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${role} user created successfully`,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role
        }
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
