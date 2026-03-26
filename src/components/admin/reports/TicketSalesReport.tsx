import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ticket, Globe, Store, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';

interface TicketSalesReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

export function TicketSalesReport({ data, isLoading }: TicketSalesReportProps) {
  const { language } = useLanguage();

  const ticketTypeData = [
    { 
      name: 'Online', 
      value: data?.tickets.online || 0,
      color: 'hsl(var(--primary))'
    },
    { 
      name: 'Physical', 
      value: data?.tickets.physical || 0,
      color: 'hsl(var(--chart-2))'
    },
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Ticket className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{data?.tickets.total || 0}</p>
            <p className="text-sm text-muted-foreground">
              {'Total Tickets'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-chart-2" />
            <p className="text-2xl font-bold">{data?.tickets.online || 0}</p>
            <p className="text-sm text-muted-foreground">
              {'Online'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Store className="w-8 h-8 mx-auto mb-2 text-chart-3" />
            <p className="text-2xl font-bold">{data?.tickets.physical || 0}</p>
            <p className="text-sm text-muted-foreground">
              {'Physical'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{usedPercentage}%</p>
            <p className="text-sm text-muted-foreground">
              {'Usage Rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{'Ticket Status'}</CardTitle>
            <CardDescription>
              {'Breakdown by status'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusData.map((status, index) => {
              const Icon = status.icon;
              const percentage = data?.tickets.total 
                ? Math.round((status.value / data.tickets.total) * 100) 
                : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${status.color}`} />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{status.value}</Badge>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Daily Ticket Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{'Daily Sales'}</CardTitle>
            <CardDescription>
              {'Ticket sales per day'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.dailyBreakdown && data.dailyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dailyBreakdown.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => value.split('-')[2]}
                  />
                  <YAxis className="text-xs" allowDecimals={false} />
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
        <CardHeader>
          <CardTitle>{'Popular Time Slots'}</CardTitle>
          <CardDescription>
            {'Most booked time slots'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {data?.popularTimeSlots && data.popularTimeSlots.length > 0 ? (
              data.popularTimeSlots.map((slot, index) => (
                <Badge 
                  key={index} 
                  variant={index === 0 ? "default" : "secondary"}
                  className="text-sm px-3 py-1.5"
                >
                  {slot.slot} ({slot.count})
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">
                {'No data available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
