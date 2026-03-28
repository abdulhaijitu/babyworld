import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ticket, Globe, Store, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';

interface TicketSalesReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

export function TicketSalesReport({ data, isLoading }: TicketSalesReportProps) {

  const statusData = [
    { 
      label: 'Used',
      value: data?.tickets.used || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      label: 'Active',
      value: data?.tickets.active || 0,
      icon: Clock,
      color: 'text-blue-600'
    },
    { 
      label: 'Cancelled',
      value: data?.tickets.cancelled || 0,
      icon: XCircle,
      color: 'text-red-600'
    },
  ];

  const usedPercentage = data?.tickets.total 
    ? Math.round((data.tickets.used / data.tickets.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <Ticket className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-primary" />
            <p className="text-lg sm:text-2xl font-bold">{data?.tickets.total || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Total Tickets'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-chart-2" />
            <p className="text-lg sm:text-2xl font-bold">{data?.tickets.online || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Online'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <Store className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-chart-3" />
            <p className="text-lg sm:text-2xl font-bold">{data?.tickets.physical || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Physical'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-green-600" />
            <p className="text-lg sm:text-2xl font-bold">{usedPercentage}%</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Usage Rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Ticket Status Breakdown */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Ticket Status'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'Breakdown by status'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-3 sm:space-y-4">
            {statusData.map((status, index) => {
              const Icon = status.icon;
              const percentage = data?.tickets.total 
                ? Math.round((status.value / data.tickets.total) * 100) 
                : 0;
              return (
                <div key={index} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${status.color}`} />
                      <span className="text-xs sm:text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">{status.value}</Badge>
                      <span className="text-[10px] sm:text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-1.5 sm:h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Daily Ticket Sales Chart */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Daily Sales'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'Ticket sales per day'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {data?.dailyBreakdown && data.dailyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dailyBreakdown.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => value.split('-')[2]}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis className="text-xs" allowDecimals={false} width={35} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Tickets']}
                    labelFormatter={(label) => `${'Date'}: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                {'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Time Slots */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-sm sm:text-base">{'Popular Time Slots'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {'Most booked time slots'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {data?.popularTimeSlots && data.popularTimeSlots.length > 0 ? (
              data.popularTimeSlots.map((slot, index) => (
                <Badge 
                  key={index} 
                  variant={index === 0 ? "default" : "secondary"}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                >
                  {slot.slot} ({slot.count})
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {'No data available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
