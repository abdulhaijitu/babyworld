import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';

export interface ReportsSummary {
  success: boolean;
  period: { start_date: string; end_date: string };
  today: {
    tickets: number;
    ticketsUsed: number;
    foodOrders: number;
    foodRevenue: number;
  };
  tickets: {
    total: number;
    active: number;
    used: number;
    cancelled: number;
    expired: number;
    online: number;
    physical: number;
    todayCount: number;
    todayUsed: number;
  };
  food: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    cashRevenue: number;
    onlineRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    topItems: Array<{
      id: string;
      name: string;
      name_bn: string;
      category: string;
      count: number;
      revenue: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      revenue: number;
    }>;
  };
  revenue: {
    totalTicketRevenue: number;
    totalFoodRevenue: number;
    combinedRevenue: number;
    onlinePayments: number;
    cashPayments: number;
    onlineRevenue: number;
    cashRevenue: number;
  };
  dailyBreakdown: Array<{
    date: string;
    tickets: number;
    ticketRevenue: number;
    foodOrders: number;
    foodRevenue: number;
    totalRevenue: number;
  }>;
  peakDay: {
    date: string;
    totalRevenue: number;
  } | null;
  popularTimeSlots: Array<{
    slot: string;
    count: number;
  }>;
  bookings: {
    total: number;
    confirmed: number;
    cancelled: number;
    hourlyPlay: number;
    events: number;
  };
}

type DateRange = 'today' | 'week' | 'month' | 'custom';

export function useReportsSummary(dateRange: DateRange, customStart?: string, customEnd?: string) {
  const { startDate, endDate } = getDateRange(dateRange, customStart, customEnd);

  return useQuery<ReportsSummary>({
    queryKey: ['reports-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-reports-summary', {
        body: {
          start_date: startDate,
          end_date: endDate,
        }
      });

      if (error) throw error;
      return data as ReportsSummary;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

function getDateRange(range: DateRange, customStart?: string, customEnd?: string): { startDate: string; endDate: string } {
  const today = new Date();
  
  switch (range) {
    case 'today':
      const todayStr = format(today, 'yyyy-MM-dd');
      return { startDate: todayStr, endDate: todayStr };
    
    case 'week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      };
    
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    
    case 'custom':
      return {
        startDate: customStart || format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: customEnd || format(today, 'yyyy-MM-dd'),
      };
    
    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
  }
}
