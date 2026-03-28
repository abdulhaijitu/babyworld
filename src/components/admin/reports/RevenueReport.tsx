import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Banknote, Ticket, UtensilsCrossed, TrendingUp, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';
import { format, parseISO } from 'date-fns';

interface RevenueReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

export function RevenueReport({ data, isLoading }: RevenueReportProps) {

  const revenueBreakdown = [
    {
      label: 'Ticket Revenue',
      value: data?.revenue.totalTicketRevenue || 0,
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Food Revenue',
      value: data?.revenue.totalFoodRevenue || 0,
      icon: UtensilsCrossed,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ];

  const chartData = data?.dailyBreakdown?.map(day => ({
    date: day.date,
    displayDate: format(parseISO(day.date), 'd', { locale: undefined }),
    tickets: day.ticketRevenue,
    food: day.foodRevenue,
    total: day.totalRevenue,
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="p-6"><Skeleton className="h-80" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-4 rounded-2xl bg-primary/20">
                <Banknote className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {'Total Revenue'}
                </p>
                <p className="text-2xl sm:text-4xl font-bold">
                  ৳{(data?.revenue.combinedRevenue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {data?.period.start_date} - {data?.period.end_date}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {revenueBreakdown.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center p-2 sm:p-4 rounded-xl bg-background/50">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${item.color}`} />
                    <p className="text-base sm:text-xl font-bold">৳{item.value.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Day Highlight */}
      {data?.peakDay && (
        <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/20">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">
                {'Peak Revenue Day'}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {format(parseISO(data.peakDay.date), 'PPP', { locale: undefined })} - 
                <span className="font-bold text-foreground ml-1">
                  ৳{data.peakDay.totalRevenue.toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-sm sm:text-base">{'Revenue Trend'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {'Daily revenue breakdown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" tickFormatter={(value) => `৳${value}`} width={55} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `৳${value.toLocaleString()}`, 
                    name === 'total' ? ('Total') :
                    name === 'tickets' ? ('Tickets') :
                    ('Food')
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload?.[0]?.payload?.date) {
                      return format(parseISO(payload[0].payload.date), 'PPP', { 
                        locale: undefined 
                      });
                    }
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              {'No data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-sm sm:text-base">{'Comparative Analysis'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {'Ticket vs Food revenue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" tickFormatter={(value) => `৳${value}`} width={55} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `৳${value.toLocaleString()}`, 
                    name === 'tickets' ? ('Tickets') :
                    ('Food')
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="food" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              {'No data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Payment Methods'}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-base text-green-700 dark:text-green-400">
                    {'Cash Payments'}
                  </p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">
                    {data?.revenue.cashPayments || 0} {'transactions'}
                  </p>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-400 whitespace-nowrap ml-2">
                  ৳{(data?.revenue.cashRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-base text-blue-700 dark:text-blue-400">
                    {'Online Payments'}
                  </p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">
                    {data?.revenue.onlinePayments || 0} {'transactions'}
                  </p>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap ml-2">
                  ৳{(data?.revenue.onlineRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Booking Summary'}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-2 sm:p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg sm:text-2xl font-bold">{data?.bookings.total || 0}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {'Total'}
                </p>
              </div>
              <div className="p-2 sm:p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg sm:text-2xl font-bold">{data?.bookings.confirmed || 0}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {'Confirmed'}
                </p>
              </div>
              <div className="p-2 sm:p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg sm:text-2xl font-bold">{data?.bookings.hourlyPlay || 0}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {'Hourly'}
                </p>
              </div>
              <div className="p-2 sm:p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg sm:text-2xl font-bold">{data?.bookings.events || 0}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {'Events'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
