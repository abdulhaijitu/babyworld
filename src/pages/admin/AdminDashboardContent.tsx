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
} from 'lucide-react';
import { useReportsSummary } from '@/hooks/useReportsSummary';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ExpiringCardsAlert } from '@/components/admin/ExpiringCardsAlert';

export default function AdminDashboardContent() {
  const navigate = useNavigate();
  const { data: summary, isLoading, error, refetch } = useReportsSummary('today');
  const today = format(new Date(), 'yyyy-MM-dd');

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
      <div className="p-4 md:p-6 lg:p-8">
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(), 'PPP')}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </div>

      {/* Expiring Hero Cards Alert */}
      <ExpiringCardsAlert />

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
              {isLoading ? <Skeleton className="h-3 w-28" /> : `${ticketCount} এর মধ্যে`}
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
                আজকের টিকেট
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/ticketing')}>
                সব দেখুন <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!recentTickets || recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">আজ কোনো টিকেট নেই</p>
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
                আজকের ফুড অর্ডার
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/food-orders')}>
                সব দেখুন <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!recentFoodOrders || recentFoodOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">আজ কোনো ফুড অর্ডার নেই</p>
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
