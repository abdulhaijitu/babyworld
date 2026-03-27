import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RefreshCw, Search, Phone, MoreVertical, CheckCircle, XCircle, Clock,
  CreditCard, Ban, X, Eye, Banknote, TrendingUp, Ticket, List, Calendar as CalendarIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { BookingCalendarView } from '@/components/admin/bookings/BookingCalendarView';

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: string;
  booking_type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
  notes: string | null;
  created_at: string;
}

const PRICE_PER_TICKET = 300;

export function BookingsListTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'hourly_play')
        .order('slot_date', { ascending: false })
        .order('time_slot', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings((data || []) as Booking[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const { error: updateError } = await supabase
        .from('bookings').update({ status }).eq('id', bookingId);
      if (updateError) throw updateError;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const handlePaymentChange = async (bookingId: string, paymentStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings').update({ payment_status: paymentStatus }).eq('id', bookingId);
      if (updateError) throw updateError;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, payment_status: paymentStatus } : b));
      toast.success('Payment updated');
    } catch { toast.error('Update failed'); }
  };

  const filteredBookings = bookings.filter(booking => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!booking.parent_name.toLowerCase().includes(q) && !booking.parent_phone.includes(q)) return false;
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (dateRangeFilter !== 'all') {
      const bookingDate = parseISO(booking.slot_date);
      const today = new Date();
      if (dateRangeFilter === 'today' && format(bookingDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
      if (dateRangeFilter === 'week' && !isWithinInterval(bookingDate, { start: startOfWeek(today), end: endOfWeek(today) })) return false;
      if (dateRangeFilter === 'month' && !isWithinInterval(bookingDate, { start: startOfMonth(today), end: endOfMonth(today) })) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CreditCard className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'partial': return <Badge variant="outline" className="text-blue-600"><CreditCard className="w-3 h-3 mr-1" />Partial</Badge>;
      default: return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" />Unpaid</Badge>;
    }
  };

  const getTicketBadge = (type: string) => {
    switch (type) {
      case 'child_guardian': return <Badge variant="outline">Child + Guardian</Badge>;
      case 'child_only': return <Badge variant="outline">Child Only</Badge>;
      case 'group': return <Badge variant="outline">Group</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.slot_date === todayStr);
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('all'); setDateRangeFilter('all'); };
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateRangeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {bookings.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl">{todayBookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{confirmedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-1">
              <List className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <BookingCalendarView
          bookings={bookings as any}
          onBookingSelect={(booking) => { setSelectedBooking(booking as any); setDetailOpen(true); }}
        />
      )}

      {/* Bookings Table - List View */}
      {viewMode === 'list' && (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Booking List</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-full md:w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}><X className="w-4 h-4" /></Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchBookings} className="mt-4" size="sm">Try Again</Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <tbody>{[1,2,3,4].map(i => <TableRowSkeleton key={i} />)}</tbody>
            </Table>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bookings found</p>
              {hasActiveFilters && <Button variant="link" onClick={clearFilters} className="mt-2">Clear filters</Button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{format(parseISO(booking.slot_date), 'dd MMM yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{booking.time_slot}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.parent_name}</div>
                        <a href={`tel:${booking.parent_phone}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Phone className="w-3 h-3" />{booking.parent_phone}
                        </a>
                      </TableCell>
                      <TableCell>{getTicketBadge(booking.ticket_type)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setDetailOpen(true); }}>
                              <Eye className="w-4 h-4 mr-2" />View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={booking.status === 'confirmed' || booking.status === 'cancelled'}>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaymentChange(booking.id, 'paid')} disabled={booking.payment_status === 'paid'}>
                              <Banknote className="w-4 h-4 mr-2 text-green-600" />Mark Paid
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'cancelled')} disabled={booking.status === 'cancelled'} className="text-destructive">
                              <Ban className="w-4 h-4 mr-2" />Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking && format(parseISO(selectedBooking.slot_date), 'EEEE, dd MMMM yyyy')}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {getTicketBadge(selectedBooking.ticket_type)}
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking.payment_status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedBooking.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedBooking.parent_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedBooking.time_slot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Booked On</Label>
                  <p className="font-medium text-sm">{format(parseISO(selectedBooking.created_at), 'dd MMM yyyy')}</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap bg-muted p-2 rounded">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
