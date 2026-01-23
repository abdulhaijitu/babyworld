import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

type ExpenseCategory = 'rent' | 'staff_salary' | 'utilities' | 'food_purchase' | 'toys_equipment' | 'maintenance' | 'marketing' | 'other';
type PaymentMethod = 'cash' | 'bank' | 'online';

interface CreateExpenseInput {
  expense_date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: PaymentMethod;
  added_by_name?: string;
  notes?: string;
}

interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

interface GetExpensesFilters {
  start_date?: string;
  end_date?: string;
  category?: ExpenseCategory;
  page?: number;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    // CREATE expense
    if (action === 'create') {
      const body: CreateExpenseInput = await req.json();

      // Validate required fields
      if (!body.category || !body.description || !body.amount) {
        return new Response(
          JSON.stringify({ error: 'category, description, and amount are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate amount is positive
      if (body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Amount must be greater than 0' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
          expense_date: body.expense_date || new Date().toISOString().split('T')[0],
          category: body.category,
          description: body.description,
          amount: body.amount,
          payment_method: body.payment_method || 'cash',
          added_by_name: body.added_by_name || 'Admin',
          notes: body.notes
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, expense }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIST expenses with filters
    if (action === 'list') {
      const body: GetExpensesFilters = req.method === 'POST' ? await req.json() : {};
      const { start_date, end_date, category, page = 1, limit = 50 } = body;

      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (start_date) {
        query = query.gte('expense_date', start_date);
      }
      if (end_date) {
        query = query.lte('expense_date', end_date);
      }
      if (category) {
        query = query.eq('category', category);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: expenses, error, count } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          expenses,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UPDATE expense (Admin only)
    if (action === 'update') {
      const body: UpdateExpenseInput = await req.json();

      if (!body.id) {
        return new Response(
          JSON.stringify({ error: 'Expense ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate amount if provided
      if (body.amount !== undefined && body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Amount must be greater than 0' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (body.expense_date) updateData.expense_date = body.expense_date;
      if (body.category) updateData.category = body.category;
      if (body.description) updateData.description = body.description;
      if (body.amount) updateData.amount = body.amount;
      if (body.payment_method) updateData.payment_method = body.payment_method;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const { data: expense, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, expense }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE expense (Admin only)
    if (action === 'delete') {
      const { id } = await req.json();

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Expense ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Expense deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET summary by category
    if (action === 'summary') {
      const body: GetExpensesFilters = req.method === 'POST' ? await req.json() : {};
      const { start_date, end_date } = body;

      let query = supabase
        .from('expenses')
        .select('category, amount');

      if (start_date) {
        query = query.gte('expense_date', start_date);
      }
      if (end_date) {
        query = query.lte('expense_date', end_date);
      }

      const { data: expenses, error } = await query;

      if (error) throw error;

      // Group by category
      const categoryTotals: Record<string, number> = {};
      let totalExpenses = 0;

      expenses?.forEach((expense) => {
        const cat = expense.category as string;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount);
        totalExpenses += Number(expense.amount);
      });

      const breakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      })).sort((a, b) => b.amount - a.amount);

      return new Response(
        JSON.stringify({ 
          success: true,
          total: totalExpenses,
          breakdown,
          period: { start_date, end_date }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: create, list, update, delete, summary' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Expense management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to process expense request', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
