import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { bn as bnLocale } from 'date-fns/locale';

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
  const { language } = useLanguage();
  const today = new Date();

  // Fetch weekly comparison data
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['comparison-weekly'],
    queryFn: async () => {
      const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const thisWeekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      
      const lastWeekStart = format(startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const lastWeekEnd = format(endOfWeek(subWeeks(today, 1), { weekStartsOn: 0 }), 'yyyy-MM-dd');

      const [thisWeek, lastWeek] = await Promise.all([
        supabase.functions.invoke('get-reports-summary', {
          body: { start_date: thisWeekStart, end_date: thisWeekEnd }
        }),
        supabase.functions.invoke('get-reports-summary', {
          body: { start_date: lastWeekStart, end_date: lastWeekEnd }
        })
      ]);

      return {
        thisWeek: thisWeek.data,
        lastWeek: lastWeek.data,
        labels: {
          current: language === 'bn' ? 'এই সপ্তাহ' : 'This Week',
          previous: language === 'bn' ? 'গত সপ্তাহ' : 'Last Week'
        }
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  // Fetch monthly comparison data (last 6 months)
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
        months.map(m => 
          supabase.functions.invoke('get-reports-summary', {
            body: { start_date: m.startDate, end_date: m.endDate }
          })
        )
      );

      return results.map((r, i) => ({
        period: format(months[i].month, 'MMM', { locale: language === 'bn' ? bnLocale : undefined }),
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

  // Weekly comparison cards
  const weeklyComparisons: ComparisonData[] = weeklyData ? [
    {
      label: language === 'bn' ? 'মোট আয়' : 'Total Revenue',
      current: weeklyData.thisWeek?.revenue?.combinedRevenue || 0,
      previous: weeklyData.lastWeek?.revenue?.combinedRevenue || 0,
      change: calculateChange(
        weeklyData.thisWeek?.revenue?.combinedRevenue || 0,
        weeklyData.lastWeek?.revenue?.combinedRevenue || 0
      )
    },
    {
      label: language === 'bn' ? 'টিকেট বিক্রয়' : 'Tickets Sold',
      current: weeklyData.thisWeek?.tickets?.total || 0,
      previous: weeklyData.lastWeek?.tickets?.total || 0,
      change: calculateChange(
        weeklyData.thisWeek?.tickets?.total || 0,
        weeklyData.lastWeek?.tickets?.total || 0
      )
    },
    {
      label: language === 'bn' ? 'খাবার অর্ডার' : 'Food Orders',
      current: weeklyData.thisWeek?.food?.completedOrders || 0,
      previous: weeklyData.lastWeek?.food?.completedOrders || 0,
      change: calculateChange(
        weeklyData.thisWeek?.food?.completedOrders || 0,
        weeklyData.lastWeek?.food?.completedOrders || 0
      )
    }
  ] : [];

  // Weekly bar chart data
  const weeklyChartData = weeklyData ? [
    {
      name: language === 'bn' ? 'আয়' : 'Revenue',
      [weeklyData.labels.current]: weeklyData.thisWeek?.revenue?.combinedRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.revenue?.combinedRevenue || 0,
    },
    {
      name: language === 'bn' ? 'টিকেট আয়' : 'Ticket Revenue',
      [weeklyData.labels.current]: weeklyData.thisWeek?.revenue?.totalTicketRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.revenue?.totalTicketRevenue || 0,
    },
    {
      name: language === 'bn' ? 'খাবার আয়' : 'Food Revenue',
      [weeklyData.labels.current]: weeklyData.thisWeek?.food?.totalRevenue || 0,
      [weeklyData.labels.previous]: weeklyData.lastWeek?.food?.totalRevenue || 0,
    }
  ] : [];

  if (weeklyLoading || monthlyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Comparison Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {language === 'bn' ? 'সাপ্তাহিক তুলনা' : 'Weekly Comparison'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeklyComparisons.map((item, index) => {
            const { icon: Icon, color, bg } = getChangeIndicator(item.change);
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-bold mt-1">
                        {item.label.includes('আয়') || item.label.includes('Revenue') 
                          ? formatBDT(item.current) 
                          : item.current}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'bn' ? 'গত সপ্তাহ: ' : 'Last week: '}
                        {item.label.includes('আয়') || item.label.includes('Revenue') 
                          ? formatBDT(item.previous) 
                          : item.previous}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
                      <Icon className="w-3 h-3" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {language === 'bn' ? 'সাপ্তাহিক আয় তুলনা' : 'Weekly Revenue Comparison'}
            </CardTitle>
            <CardDescription>
              {language === 'bn' ? 'এই সপ্তাহ বনাম গত সপ্তাহ' : 'This week vs last week'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [formatBDT(value), '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={weeklyData?.labels.current} 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name={weeklyData?.labels.current}
                  />
                  <Bar 
                    dataKey={weeklyData?.labels.previous} 
                    fill="hsl(var(--muted-foreground))" 
                    radius={[0, 4, 4, 0]}
                    name={weeklyData?.labels.previous}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'মাসিক আয় প্রবণতা' : 'Monthly Revenue Trend'}</CardTitle>
            <CardDescription>
              {language === 'bn' ? 'গত ৬ মাসের তুলনা' : 'Last 6 months comparison'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [formatBDT(value), language === 'bn' ? 'আয়' : 'Revenue'];
                      return [value, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name={language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'bn' ? 'মাসিক কার্যক্রম' : 'Monthly Activity'}</CardTitle>
          <CardDescription>
            {language === 'bn' ? 'টিকেট ও খাবার অর্ডারের তুলনা' : 'Tickets and food orders comparison'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="tickets" 
                  name={language === 'bn' ? 'টিকেট' : 'Tickets'}
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="foodOrders" 
                  name={language === 'bn' ? 'খাবার অর্ডার' : 'Food Orders'}
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
