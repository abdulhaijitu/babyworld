import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Banknote, Ticket, UtensilsCrossed, TrendingUp, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';

interface RevenueReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

export function RevenueReport({ data, isLoading }: RevenueReportProps) {
  const { language } = useLanguage();

  const revenueBreakdown = [
    {
      label: language === 'bn' ? 'টিকেট আয়' : 'Ticket Revenue',
      value: data?.revenue.totalTicketRevenue || 0,
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: language === 'bn' ? 'খাবার আয়' : 'Food Revenue',
      value: data?.revenue.totalFoodRevenue || 0,
      icon: UtensilsCrossed,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ];

  const chartData = data?.dailyBreakdown?.map(day => ({
    date: day.date,
    displayDate: format(parseISO(day.date), 'd', { locale: language === 'bn' ? bn : undefined }),
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
    <div className="space-y-6">
      {/* Main Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20">
                <Banknote className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                </p>
                <p className="text-4xl font-bold">
                  ৳{(data?.revenue.combinedRevenue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data?.period.start_date} - {data?.period.end_date}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {revenueBreakdown.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-background/50">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                    <p className="text-xl font-bold">৳{item.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
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
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium">
                {language === 'bn' ? 'সর্বোচ্চ আয়ের দিন' : 'Peak Revenue Day'}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(data.peakDay.date), 'PPP', { locale: language === 'bn' ? bn : undefined })} - 
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
        <CardHeader>
          <CardTitle>{language === 'bn' ? 'আয়ের ট্রেন্ড' : 'Revenue Trend'}</CardTitle>
          <CardDescription>
            {language === 'bn' ? 'দৈনিক আয়ের গ্রাফ' : 'Daily revenue breakdown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `৳${value.toLocaleString()}`, 
                    name === 'total' ? (language === 'bn' ? 'মোট' : 'Total') :
                    name === 'tickets' ? (language === 'bn' ? 'টিকেট' : 'Tickets') :
                    (language === 'bn' ? 'খাবার' : 'Food')
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload?.[0]?.payload?.date) {
                      return format(parseISO(payload[0].payload.date), 'PPP', { 
                        locale: language === 'bn' ? bn : undefined 
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
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'bn' ? 'তুলনামূলক বিশ্লেষণ' : 'Comparative Analysis'}</CardTitle>
          <CardDescription>
            {language === 'bn' ? 'টিকেট বনাম খাবার আয়' : 'Ticket vs Food revenue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `৳${value.toLocaleString()}`, 
                    name === 'tickets' ? (language === 'bn' ? 'টিকেট' : 'Tickets') :
                    (language === 'bn' ? 'খাবার' : 'Food')
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend 
                  formatter={(value) => 
                    value === 'tickets' ? (language === 'bn' ? 'টিকেট' : 'Tickets') :
                    (language === 'bn' ? 'খাবার' : 'Food')
                  }
                />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="food" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Methods'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {language === 'bn' ? 'নগদ পেমেন্ট' : 'Cash Payments'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data?.revenue.cashPayments || 0} {language === 'bn' ? 'টি লেনদেন' : 'transactions'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ৳{(data?.revenue.cashRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    {language === 'bn' ? 'অনলাইন পেমেন্ট' : 'Online Payments'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data?.revenue.onlinePayments || 0} {language === 'bn' ? 'টি লেনদেন' : 'transactions'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  ৳{(data?.revenue.onlineRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'বুকিং সারাংশ' : 'Booking Summary'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data?.bookings.total || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'মোট বুকিং' : 'Total'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data?.bookings.confirmed || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'কনফার্মড' : 'Confirmed'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data?.bookings.hourlyPlay || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'আওয়ারলি' : 'Hourly'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data?.bookings.events || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'ইভেন্ট' : 'Events'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
