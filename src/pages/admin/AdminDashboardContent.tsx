import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Banknote,
  Ticket,
  UtensilsCrossed,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
  Baby,
  UserCheck,
} from 'lucide-react';
import { useReportsSummary } from '@/hooks/useReportsSummary';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ExpiringCardsAlert } from '@/components/admin/ExpiringCardsAlert';
import { useEffect, useState } from 'react';

function useVisitorCount() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['live-visitors', today],
    queryFn: async () => {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('child_count, guardian_count, inside_venue')
        .eq('slot_date', today)
        .eq('inside_venue', true);

      const insideChildren = (tickets || []).reduce((sum, t) => sum + (t.child_count || 0), 0);
      const insideGuardians = (tickets || []).reduce((sum, t) => sum + (t.guardian_count || 0), 0);
      return { insideChildren, insideGuardians, total: insideChildren + insideGuardians };
    },
    refetchInterval: 15000, // auto-refresh every 15s
  });

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('visitor-counter')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `slot_date=eq.${today}` }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [today, refetch]);

  return { data: data || { insideChildren: 0, insideGuardians: 0, total: 0 }, isLoading };
}

export default function AdminDashboardContent() {
  const navigate = useNavigate();
  const { data: summary, isLoading, error, refetch } = useReportsSummary('today');
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: visitors, isLoading: visitorsLoading } = useVisitorCount();

  // Today's latest 5 tickets
  const { data: recentTickets } = useQuery({
    queryKey: ['dashboard-recent-tickets', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('tickets')
        .select('id, ticket_number, guardian_name, total_price, status, created_at')
        .eq('slot_date', today)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Today's latest 5 food orders
  const { data: recentFoodOrders } = useQuery({
    queryKey: ['dashboard-recent-food', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('food_orders')
        .select('id, order_number, customer_name, total, status, created_at')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const todayRevenue = (summary?.revenue?.combinedRevenue || 0);
  const ticketCount = summary?.today?.tickets || 0;
  const foodRevenue = summary?.today?.foodRevenue || 0;
  const ticketRevenue = summary?.revenue?.totalTicketRevenue || 0;

  if (error) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive font-medium mb-2">Failed to load dashboard</p>
          <Button onClick={() => refetch()} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(), 'PPP')}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </div>

      {/* Expiring Hero Cards Alert */}
      <ExpiringCardsAlert />

      {/* Live Visitor Counter */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Now Inside Venue</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {visitorsLoading ? <Skeleton className="h-9 w-16" /> : visitors.total}
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Baby className="w-4 h-4" />
                  <span className="text-xs">Children</span>
                </div>
                <p className="text-xl font-semibold text-foreground">
                  {visitorsLoading ? <Skeleton className="h-7 w-10 mx-auto" /> : visitors.insideChildren}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xs">Guardians</span>
                </div>
                <p className="text-xl font-semibold text-foreground">
                  {visitorsLoading ? <Skeleton className="h-7 w-10 mx-auto" /> : visitors.insideGuardians}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4" />
              Today's Total Revenue
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-28" /> : `৳${todayRevenue.toLocaleString()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tickets + Food Sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4" />
              Ticket Sales
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-20" /> : ticketCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-24" /> : `৳${ticketRevenue.toLocaleString()} revenue`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4" />
              Food Revenue
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `৳${foodRevenue.toLocaleString()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-20" /> : `${summary?.today?.foodOrders || 0} orders`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Tickets Used
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : (summary?.today?.ticketsUsed || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-28" /> : `out of ${ticketCount}`}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Today's Tickets & Recent Food Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tickets */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Today's Tickets
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/ticket-list')}>
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!recentTickets || recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tickets today</p>
            ) : (
              <div className="space-y-2">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.guardian_name}</p>
                      <p className="text-xs text-muted-foreground">#{ticket.ticket_number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">৳{Number(ticket.total_price || 0).toLocaleString()}</span>
                      <Badge variant={ticket.status === 'used' ? 'secondary' : ticket.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Food Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Today's Food Orders
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/food-orders')}>
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!recentFoodOrders || recentFoodOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No food orders today</p>
            ) : (
              <div className="space-y-2">
                {recentFoodOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{order.customer_name || 'Walk-in'}</p>
                      <p className="text-xs text-muted-foreground">#{order.order_number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">৳{Number(order.total || 0).toLocaleString()}</span>
                      <Badge variant={order.status === 'served' ? 'secondary' : order.status === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
