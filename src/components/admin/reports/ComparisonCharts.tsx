import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  change: number;
}

interface PeriodData {
  period: string;
  revenue: number;
  tickets: number;
  foodOrders: number;
}

export function ComparisonCharts() {
  const today = new Date();

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['comparison-weekly'],
    queryFn: async () => {
      const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const thisWeekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const lastWeekStart = format(startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const lastWeekEnd = format(endOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }), 'yyyy-MM-dd');

      const [thisWeek, lastWeek] = await Promise.all([
        supabase.functions.invoke('get-reports-summary', { body: { start_date: thisWeekStart, end_date: thisWeekEnd } }),
        supabase.functions.invoke('get-reports-summary', { body: { start_date: lastWeekStart, end_date: lastWeekEnd } })
      ]);

      return {
        thisWeek: thisWeek.data,
        lastWeek: lastWeek.data,
        labels: { current: 'This Week', previous: 'Last Week' }
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['comparison-monthly'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
        months.push({ startDate, endDate, month: monthDate });
      }

      const results = await Promise.all(
        months.map(m => supabase.functions.invoke('get-reports-summary', { body: { start_date: m.startDate, end_date: m.endDate } }))
      );

      return results.map((r, i) => ({
        period: format(months[i].month, 'MMM', { locale: undefined }),
        revenue: r.data?.revenue?.combinedRevenue || 0,
        tickets: r.data?.tickets?.total || 0,
        foodOrders: r.data?.food?.completedOrders || 0
      }));
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false
  });

  const formatBDT = (value: number) => `৳${value.toLocaleString()}`;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    if (change < 0) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const weeklyComparisons: ComparisonData[] = weeklyData ? [
    {
      label: 'Total Revenue',
      current: weeklyData.thisWeek?.revenue?.combinedRevenue || 0,
      previous: weeklyData.lastWeek?.revenue?.combinedRevenue || 0,
      change: calculateChange(weeklyData.thisWeek?.revenue?.combinedRevenue || 0, weeklyData.lastWeek?.revenue?.combinedRevenue || 0)
    },
    {
      label: 'Tickets Sold',
      current: weeklyData.thisWeek?.tickets?.total || 0,
      previous: weeklyData.lastWeek?.tickets?.total || 0,
      change: calculateChange(weeklyData.thisWeek?.tickets?.total || 0, weeklyData.lastWeek?.tickets?.total || 0)
    },
    {
      label: 'Food Orders',
      current: weeklyData.thisWeek?.food?.completedOrders || 0,
      previous: weeklyData.lastWeek?.food?.completedOrders || 0,
      change: calculateChange(weeklyData.thisWeek?.food?.completedOrders || 0, weeklyData.lastWeek?.food?.completedOrders || 0)
    }
  ] : [];

  const weeklyChartData = weeklyData ? [
    {
      name: 'Revenue',
      [weeklyData.labels.current]: weeklyData.thisWeek?.revenue?.combinedRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.revenue?.combinedRevenue || 0,
    },
    {
      name: 'Tickets',
      [weeklyData.labels.current]: weeklyData.thisWeek?.revenue?.totalTicketRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.revenue?.totalTicketRevenue || 0,
    },
    {
      name: 'Food',
      [weeklyData.labels.current]: weeklyData.thisWeek?.food?.totalRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.food?.totalRevenue || 0,
    }
  ] : [];

  if (weeklyLoading || monthlyLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-2 sm:p-4"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Weekly Comparison Cards */}
      <div>
        <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          {'Weekly Comparison'}
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {weeklyComparisons.map((item, index) => {
            const { icon: Icon, color, bg } = getChangeIndicator(item.change);
            return (
              <Card key={index}>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{item.label}</p>
                      <p className="text-base sm:text-2xl font-bold mt-0.5">
                        {item.label.includes('Revenue') ? formatBDT(item.current) : item.current}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {'Last: '}
                        {item.label.includes('Revenue') ? formatBDT(item.previous) : item.previous}
                      </p>
                    </div>
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium ${bg} ${color} self-start`}>
                      <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Comparison Bar Chart */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              {'Weekly Revenue'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'This week vs last week'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={55} className="text-xs" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [formatBDT(value), '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey={weeklyData?.labels.current} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name={weeklyData?.labels.current} />
                  <Bar dataKey={weeklyData?.labels.previous} fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} name={weeklyData?.labels.previous} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">{'No data available'}</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Monthly Revenue Trend'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{'Last 6 months comparison'}</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} className="text-xs" width={50} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [formatBDT(value), 'Revenue'];
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" name={'Total Revenue'} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">{'No data available'}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats Bar Chart */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-sm sm:text-base">{'Monthly Activity'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{'Tickets and food orders comparison'}</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          {monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" width={35} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tickets" name={'Tickets'} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="foodOrders" name={'Food Orders'} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">{'No data available'}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
