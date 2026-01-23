import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface ReportParams {
  start_date: string;
  end_date: string;
  report_type?: 'overview' | 'tickets' | 'food' | 'revenue';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const body: ReportParams = await req.json();
    const { start_date, end_date, report_type = 'overview' } = body;

    if (!start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'start_date and end_date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's date for comparison
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch tickets data
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .gte('slot_date', start_date)
      .lte('slot_date', end_date);

    if (ticketsError) throw ticketsError;

    // Fetch food orders data
    const { data: foodOrders, error: foodOrdersError } = await supabase
      .from('food_orders')
      .select(`
        *,
        food_order_items (
          quantity,
          unit_price,
          total_price,
          food_item_id
        )
      `)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`);

    if (foodOrdersError) throw foodOrdersError;

    // Fetch food items for name lookup
    const { data: foodItems } = await supabase
      .from('food_items')
      .select('id, name, name_bn, category');

    // Fetch payments data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`);

    if (paymentsError) throw paymentsError;

    // Fetch bookings data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .gte('slot_date', start_date)
      .lte('slot_date', end_date);

    if (bookingsError) throw bookingsError;

    // Fetch today's data for quick stats
    const { data: todayTickets } = await supabase
      .from('tickets')
      .select('id, status, source')
      .eq('slot_date', today);

    const { data: todayFoodOrders } = await supabase
      .from('food_orders')
      .select('id, total, status')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    // Calculate ticket statistics
    const ticketStats = {
      total: tickets?.length || 0,
      active: tickets?.filter(t => t.status === 'active').length || 0,
      used: tickets?.filter(t => t.status === 'used').length || 0,
      cancelled: tickets?.filter(t => t.status === 'cancelled').length || 0,
      expired: tickets?.filter(t => t.status === 'expired').length || 0,
      online: tickets?.filter(t => t.source === 'online').length || 0,
      physical: tickets?.filter(t => t.source === 'physical').length || 0,
      todayCount: todayTickets?.length || 0,
      todayUsed: todayTickets?.filter(t => t.status === 'used').length || 0,
    };

    // Calculate food statistics - check both 'completed' and 'served' statuses
    const completedFoodOrders = foodOrders?.filter(o => o.status === 'completed' || o.status === 'served') || [];
    const foodStats = {
      totalOrders: foodOrders?.length || 0,
      completedOrders: completedFoodOrders.length,
      totalRevenue: completedFoodOrders.reduce((sum, o) => sum + Number(o.total), 0),
      cashRevenue: completedFoodOrders.filter(o => o.payment_type === 'cash').reduce((sum, o) => sum + Number(o.total), 0),
      onlineRevenue: completedFoodOrders.filter(o => o.payment_type !== 'cash').reduce((sum, o) => sum + Number(o.total), 0),
      todayOrders: todayFoodOrders?.length || 0,
      todayRevenue: todayFoodOrders?.filter(o => o.status === 'completed' || o.status === 'served').reduce((sum, o) => sum + Number(o.total), 0) || 0,
    };

    // Calculate top food items
    const itemSales: Record<string, { count: number; revenue: number; name: string; name_bn: string; category: string }> = {};
    completedFoodOrders.forEach(order => {
      order.food_order_items?.forEach((item: any) => {
        const foodItem = foodItems?.find(f => f.id === item.food_item_id);
        if (foodItem) {
          if (!itemSales[item.food_item_id]) {
            itemSales[item.food_item_id] = { 
              count: 0, 
              revenue: 0, 
              name: foodItem.name, 
              name_bn: foodItem.name_bn || foodItem.name,
              category: foodItem.category 
            };
          }
          itemSales[item.food_item_id].count += item.quantity;
          itemSales[item.food_item_id].revenue += Number(item.total_price);
        }
      });
    });

    const topFoodItems = Object.entries(itemSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate payment/revenue statistics
    const completedPayments = payments?.filter(p => p.status === 'completed') || [];
    const revenueStats = {
      totalTicketRevenue: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      totalFoodRevenue: foodStats.totalRevenue,
      combinedRevenue: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0) + foodStats.totalRevenue,
      onlinePayments: completedPayments.filter(p => p.payment_method && p.payment_method !== 'cash').length,
      cashPayments: completedPayments.filter(p => !p.payment_method || p.payment_method === 'cash').length,
      onlineRevenue: completedPayments.filter(p => p.payment_method && p.payment_method !== 'cash').reduce((sum, p) => sum + Number(p.amount), 0),
      cashRevenue: completedPayments.filter(p => !p.payment_method || p.payment_method === 'cash').reduce((sum, p) => sum + Number(p.amount), 0) + foodStats.cashRevenue,
    };

    // Calculate daily breakdown
    const dailyData: Record<string, { tickets: number; ticketRevenue: number; foodOrders: number; foodRevenue: number }> = {};
    
    tickets?.forEach(t => {
      const date = t.slot_date;
      if (!dailyData[date]) {
        dailyData[date] = { tickets: 0, ticketRevenue: 0, foodOrders: 0, foodRevenue: 0 };
      }
      dailyData[date].tickets++;
    });

    completedPayments.forEach(p => {
      const date = p.created_at.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].ticketRevenue += Number(p.amount);
      }
    });

    completedFoodOrders.forEach(o => {
      const date = o.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { tickets: 0, ticketRevenue: 0, foodOrders: 0, foodRevenue: 0 };
      }
      dailyData[date].foodOrders++;
      dailyData[date].foodRevenue += Number(o.total);
    });

    const dailyBreakdown = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data, totalRevenue: data.ticketRevenue + data.foodRevenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Find peak days
    const peakDay = dailyBreakdown.reduce((max, day) => 
      day.totalRevenue > (max?.totalRevenue || 0) ? day : max, 
      dailyBreakdown[0]
    );

    // Calculate time slot popularity
    const timeSlotCounts: Record<string, number> = {};
    tickets?.forEach(t => {
      if (t.time_slot) {
        timeSlotCounts[t.time_slot] = (timeSlotCounts[t.time_slot] || 0) + 1;
      }
    });

    const popularTimeSlots = Object.entries(timeSlotCounts)
      .map(([slot, count]) => ({ slot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category breakdown for food
    const categoryBreakdown: Record<string, { count: number; revenue: number }> = {};
    topFoodItems.forEach(item => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { count: 0, revenue: 0 };
      }
      categoryBreakdown[item.category].count += item.count;
      categoryBreakdown[item.category].revenue += item.revenue;
    });

    const response = {
      success: true,
      period: { start_date, end_date },
      today: {
        tickets: ticketStats.todayCount,
        ticketsUsed: ticketStats.todayUsed,
        foodOrders: foodStats.todayOrders,
        foodRevenue: foodStats.todayRevenue,
      },
      tickets: ticketStats,
      food: {
        ...foodStats,
        topItems: topFoodItems,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({ category, ...data })),
      },
      revenue: revenueStats,
      dailyBreakdown,
      peakDay,
      popularTimeSlots,
      bookings: {
        total: bookings?.length || 0,
        confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
        hourlyPlay: bookings?.filter(b => b.booking_type === 'hourly_play').length || 0,
        events: bookings?.filter(b => b.booking_type !== 'hourly_play').length || 0,
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reports error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to generate report', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
