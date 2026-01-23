import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface ProfitRequest {
  start_date: string;
  end_date: string;
  group_by?: 'daily' | 'weekly' | 'monthly';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: ProfitRequest = await req.json();

    if (!body.start_date || !body.end_date) {
      return new Response(
        JSON.stringify({ error: 'start_date and end_date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { start_date, end_date, group_by = 'daily' } = body;

    // Get ticket revenue
    const { data: tickets } = await supabase
      .from('tickets')
      .select('slot_date, total_price, entry_price, socks_price, addons_price')
      .gte('slot_date', start_date)
      .lte('slot_date', end_date)
      .neq('status', 'cancelled');

    // Get food revenue
    const { data: foodOrders } = await supabase
      .from('food_orders')
      .select('created_at, total')
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`)
      .eq('status', 'served');

    // Get expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('expense_date, category, amount')
      .gte('expense_date', start_date)
      .lte('expense_date', end_date);

    // Calculate totals
    let totalTicketRevenue = 0;
    let totalFoodRevenue = 0;
    let totalExpenses = 0;

    tickets?.forEach(t => {
      totalTicketRevenue += Number(t.total_price || 0);
    });

    foodOrders?.forEach(f => {
      totalFoodRevenue += Number(f.total || 0);
    });

    expenses?.forEach(e => {
      totalExpenses += Number(e.amount || 0);
    });

    const totalRevenue = totalTicketRevenue + totalFoodRevenue;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Calculate expense breakdown by category
    const expenseByCategory: Record<string, number> = {};
    expenses?.forEach(e => {
      const cat = e.category as string;
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount || 0);
    });

    const expenseBreakdown = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate daily breakdown
    const dailyData: Record<string, { date: string; ticketRevenue: number; foodRevenue: number; expenses: number; profit: number }> = {};

    // Initialize dates
    const currentDate = new Date(start_date);
    const endDateObj = new Date(end_date);
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        ticketRevenue: 0,
        foodRevenue: 0,
        expenses: 0,
        profit: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate ticket revenue
    tickets?.forEach(t => {
      const date = t.slot_date;
      if (dailyData[date]) {
        dailyData[date].ticketRevenue += Number(t.total_price || 0);
      }
    });

    // Populate food revenue
    foodOrders?.forEach(f => {
      const date = f.created_at.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].foodRevenue += Number(f.total || 0);
      }
    });

    // Populate expenses
    expenses?.forEach(e => {
      const date = e.expense_date;
      if (dailyData[date]) {
        dailyData[date].expenses += Number(e.amount || 0);
      }
    });

    // Calculate daily profit
    Object.values(dailyData).forEach(d => {
      d.profit = d.ticketRevenue + d.foodRevenue - d.expenses;
    });

    const dailyBreakdown = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    // Revenue breakdown
    const revenueBreakdown = [
      { source: 'tickets', amount: totalTicketRevenue, percentage: totalRevenue > 0 ? Math.round((totalTicketRevenue / totalRevenue) * 100) : 0 },
      { source: 'food', amount: totalFoodRevenue, percentage: totalRevenue > 0 ? Math.round((totalFoodRevenue / totalRevenue) * 100) : 0 }
    ];

    // Top expense categories
    const topExpenseCategories = expenseBreakdown.slice(0, 5);

    return new Response(
      JSON.stringify({
        success: true,
        period: { start_date, end_date },
        summary: {
          totalRevenue,
          totalTicketRevenue,
          totalFoodRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          isProfit: netProfit >= 0
        },
        revenueBreakdown,
        expenseBreakdown,
        topExpenseCategories,
        dailyBreakdown,
        stats: {
          ticketCount: tickets?.length || 0,
          foodOrderCount: foodOrders?.length || 0,
          expenseCount: expenses?.length || 0,
          avgDailyRevenue: dailyBreakdown.length > 0 ? Math.round(totalRevenue / dailyBreakdown.length) : 0,
          avgDailyExpense: dailyBreakdown.length > 0 ? Math.round(totalExpenses / dailyBreakdown.length) : 0,
          avgDailyProfit: dailyBreakdown.length > 0 ? Math.round(netProfit / dailyBreakdown.length) : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Profit summary error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to calculate profit summary', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
