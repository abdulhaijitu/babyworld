import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import {
  CalendarIcon,
  Ticket,
  UtensilsCrossed,
  Crown,
  Banknote,
  CreditCard,
  Wallet,
  TrendingUp,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminDailyCashSummary() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch ticket sales for the day
  const { data: ticketData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['daily-cash-tickets', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, guardian_name, total_price, payment_type, payment_status, created_at')
        .eq('slot_date', dateStr)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch food orders for the day
  const { data: foodData, isLoading: foodLoading } = useQuery({
    queryKey: ['daily-cash-food', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_orders')
        .select('id, order_number, customer_name, total, payment_type, status, created_at')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch membership payments for the day
  const { data: membershipData, isLoading: membershipLoading } = useQuery({
    queryKey: ['daily-cash-membership', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select('id, member_name, phone, membership_type, created_at')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = ticketsLoading || foodLoading || membershipLoading;

  // Calculate summaries
  const ticketTotal = ticketData?.reduce((sum, t) => sum + Number(t.total_price || 0), 0) || 0;
  const ticketCash = ticketData?.filter(t => t.payment_type === 'cash').reduce((sum, t) => sum + Number(t.total_price || 0), 0) || 0;
  const ticketOnline = ticketData?.filter(t => t.payment_type === 'online').reduce((sum, t) => sum + Number(t.total_price || 0), 0) || 0;
  const ticketCount = ticketData?.length || 0;

  const foodTotal = foodData?.reduce((sum, f) => sum + Number(f.total || 0), 0) || 0;
  const foodCash = foodData?.filter(f => f.payment_type === 'cash').reduce((sum, f) => sum + Number(f.total || 0), 0) || 0;
  const foodOnline = foodData?.filter(f => f.payment_type === 'online').reduce((sum, f) => sum + Number(f.total || 0), 0) || 0;
  const foodCount = foodData?.length || 0;

  const membershipCount = membershipData?.length || 0;

  const grandTotal = ticketTotal + foodTotal;
  const totalCash = ticketCash + foodCash;
  const totalOnline = ticketOnline + foodOnline;

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-4 print:p-2">
      {/* Header */}
      <div className="flex items-center justify-end gap-1 lg:gap-2 print:hidden">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPreviousDay}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs lg:text-sm">
              <CalendarIcon className="w-3 h-3 mr-1 lg:w-4 lg:h-4 lg:mr-2" />
              {format(selectedDate, 'dd MMM yyyy')}
              {isToday && <Badge variant="secondary" className="ml-1 text-[10px] lg:text-xs">Today</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextDay}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={() => window.print()}>
          <Printer className="w-4 h-4 lg:mr-1" /><span className="hidden lg:inline">Print</span>
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-bold">Daily Cash Summary</h2>
        <p className="text-sm">{format(selectedDate, 'dd MMMM yyyy')}</p>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Grand Total */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Grand Total</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">৳{grandTotal.toLocaleString()}</div>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> ৳{totalCash.toLocaleString()}</span>
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> ৳{totalOnline.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Collection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Sales</CardTitle>
              <Ticket className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{ticketTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{ticketCount} tickets</p>
            </CardContent>
          </Card>

          {/* Food Collection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Food Sales</CardTitle>
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{foodTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{foodCount} orders</p>
            </CardContent>
          </Card>

          {/* Memberships */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Memberships</CardTitle>
              <Crown className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Cash</TableHead>
                  <TableHead className="text-right">Online</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-500" /> Tickets
                  </TableCell>
                  <TableCell className="text-right">৳{ticketCash.toLocaleString()}</TableCell>
                  <TableCell className="text-right">৳{ticketOnline.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">৳{ticketTotal.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" /> Food
                  </TableCell>
                  <TableCell className="text-right">৳{foodCash.toLocaleString()}</TableCell>
                  <TableCell className="text-right">৳{foodOnline.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">৳{foodTotal.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">৳{totalCash.toLocaleString()}</TableCell>
                  <TableCell className="text-right">৳{totalOnline.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-primary">৳{grandTotal.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Ticket Details */}
      {!isLoading && ticketData && ticketData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-500" />
              Ticket Sales ({ticketCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Ticket No</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketData.map((ticket, i) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                      <TableCell>{ticket.guardian_name}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.payment_type === 'cash' ? 'secondary' : 'outline'} className="text-xs">
                          {ticket.payment_type || 'cash'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">৳{Number(ticket.total_price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(ticket.created_at), 'hh:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Food Order Details */}
      {!isLoading && foodData && foodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Food Orders ({foodCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Order No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodData.map((order, i) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>{order.customer_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={order.payment_type === 'cash' ? 'secondary' : 'outline'} className="text-xs">
                          {order.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">৳{Number(order.total || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(order.created_at), 'hh:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && ticketCount === 0 && foodCount === 0 && membershipCount === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions recorded for {format(selectedDate, 'dd MMM yyyy')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
