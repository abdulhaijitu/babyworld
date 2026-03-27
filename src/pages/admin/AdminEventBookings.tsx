import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw, Search, Phone, MoreVertical, CheckCircle, XCircle, Clock,
  CreditCard, X, PartyPopper, Cake, Gift, Banknote, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';

interface EventBooking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: string;
  booking_type: 'birthday_event' | 'private_event';
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
  notes: string | null;
  created_at: string;
}

export default function AdminEventBookings() {
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBooking | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .in('booking_type', ['birthday_event', 'private_event'])
        .order('slot_date', { ascending: false });
      if (fetchError) throw fetchError;
      setEvents((data || []) as EventBooking[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleStatusChange = async (eventId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', eventId);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const handlePaymentChange = async (eventId: string, paymentStatus: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ payment_status: paymentStatus }).eq('id', eventId);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, payment_status: paymentStatus } : e));
      toast.success('Payment updated');
    } catch { toast.error('Update failed'); }
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!event.parent_name.toLowerCase().includes(q) && !event.parent_phone.includes(q)) return false;
    }
    if (typeFilter !== 'all' && event.booking_type !== typeFilter) return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    return true;
  });

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all';
  const birthdayCount = events.filter(e => e.booking_type === 'birthday_event').length;
  const privateCount = events.filter(e => e.booking_type === 'private_event').length;
  const confirmedCount = events.filter(e => e.status === 'confirmed').length;
  const pendingCount = events.filter(e => e.status === 'pending').length;

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

  const getTypeBadge = (type: string) => {
    if (type === 'birthday_event') return <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20"><Cake className="w-3 h-3 mr-1" />Birthday</Badge>;
    return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20"><Gift className="w-3 h-3 mr-1" />Private</Badge>;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="w-6 h-6" /> Event Bookings
        </h1>
        <p className="text-muted-foreground">All birthday & private event bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardHeader className="pb-2">
            <CardDescription>Birthday Parties</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2"><Cake className="w-5 h-5 text-pink-500" />{birthdayCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardDescription>Private Events</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2"><Gift className="w-5 h-5 text-purple-500" />{privateCount}</CardTitle>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Booking List</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="birthday_event">Birthday</SelectItem>
                <SelectItem value="private_event">Private</SelectItem>
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
              <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchEvents} className="mt-4" size="sm">Try Again</Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <tbody>{[1,2,3].map(i => <TableRowSkeleton key={i} />)}</tbody>
            </Table>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No event bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{format(parseISO(event.slot_date), 'dd MMM yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{event.time_slot}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.parent_name}</div>
                        <a href={`tel:${event.parent_phone}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Phone className="w-3 h-3" />{event.parent_phone}
                        </a>
                      </TableCell>
                      <TableCell>{getTypeBadge(event.booking_type)}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>{getPaymentBadge(event.payment_status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedEvent(event); setDetailOpen(true); }}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'confirmed')}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'cancelled')}>
                              <XCircle className="w-4 h-4 mr-2" /> Cancel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePaymentChange(event.id, 'paid')}>
                              <Banknote className="w-4 h-4 mr-2" /> Mark Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaymentChange(event.id, 'partial')}>
                              <CreditCard className="w-4 h-4 mr-2" /> Mark Partial
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
          <DialogHeader><DialogTitle>Event Details</DialogTitle></DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Customer</p><p className="font-medium">{selectedEvent.parent_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selectedEvent.parent_phone}</p></div>
                <div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium">{format(parseISO(selectedEvent.slot_date), 'dd MMM yyyy')}</p></div>
                <div><p className="text-sm text-muted-foreground">Time</p><p className="font-medium">{selectedEvent.time_slot}</p></div>
                <div><p className="text-sm text-muted-foreground">Type</p>{getTypeBadge(selectedEvent.booking_type)}</div>
                <div><p className="text-sm text-muted-foreground">Status</p>{getStatusBadge(selectedEvent.status)}</div>
                <div><p className="text-sm text-muted-foreground">Payment</p>{getPaymentBadge(selectedEvent.payment_status)}</div>
                <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{format(parseISO(selectedEvent.created_at), 'dd MMM yyyy hh:mm a')}</p></div>
              </div>
              {selectedEvent.notes && (
                <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">{selectedEvent.notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
