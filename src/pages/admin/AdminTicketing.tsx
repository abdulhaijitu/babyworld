import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Search, 
  Ticket, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  CalendarDays,
  Loader2,
  AlertCircle,
  X,
  Printer,
  MessageSquare,
  DoorOpen,
  DoorClosed,
  CreditCard,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { PrintableTicket } from '@/components/admin/PrintableTicket';
import { QRScannerDialog } from '@/components/admin/QRScannerDialog';
import { CounterTicketForm } from '@/components/admin/ticketing/CounterTicketForm';
import { TicketSuccessDialog } from '@/components/admin/ticketing/TicketSuccessDialog';


interface TicketType {
  id: string;
  ticket_number: string;
  ticket_type: string;
  source: 'online' | 'physical';
  status: 'active' | 'used' | 'cancelled';
  slot_date: string;
  time_slot: string | null;
  child_name: string | null;
  guardian_name: string;
  guardian_phone: string;
  notes: string | null;
  used_at: string | null;
  inside_venue: boolean;
  created_at: string;
  // Price fields
  entry_price?: number | null;
  socks_price?: number | null;
  addons_price?: number | null;
  discount_applied?: number | null;
  total_price?: number | null;
  guardian_count?: number | null;
  child_count?: number | null;
  socks_count?: number | null;
  membership_id?: string | null;
  // Payment fields
  payment_type?: string | null;
  payment_status?: string | null;
  // Time fields
  in_time?: string | null;
  out_time?: string | null;
}

const PAGE_SIZE = 50;

export default function AdminTicketing() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rideNames, setRideNames] = useState<Record<string, string>>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  // Print dialog
  const [printOpen, setPrintOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [sendingSMS, setSendingSMS] = useState<string | null>(null);
  const [gateActionLoading, setGateActionLoading] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('tab') || 'list';
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const handleTicketCreated = (ticket: any) => {
    setCreatedTicket(ticket);
    setShowSuccessDialog(true);
    fetchTickets();
    setSearchParams({ tab: 'list' }, { replace: true });
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsResult, ridesResult] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('rides').select('id, name, name_bn').eq('is_active', true)
      ]);

      if (ticketsResult.error) throw ticketsResult.error;
      setTickets((ticketsResult.data || []) as TicketType[]);
      
      if (ridesResult.data) {
        const names: Record<string, string> = {};
        ridesResult.data.forEach((ride: any) => {
          names[ride.id] = ride.name;
        });
        setRideNames(names);
      }
    } catch (err: any) {
      console.error('[Ticketing] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleMarkUsed = async (ticketId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      toast.success('Ticket marked as used');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'used' as const, used_at: new Date().toISOString() } : t
      ));
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      toast.success('Ticket cancelled');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'cancelled' as const } : t
      ));
    } catch (err) {
      toast.error('Cancel failed');
    }
  };

  const handlePrintTicket = async (ticket: TicketType) => {
    setSelectedTicket(ticket);
    // Fetch ride details for this ticket
    try {
      const { data: ticketRides } = await supabase
        .from('ticket_rides')
        .select('ride_id, quantity, total_price, unit_price')
        .eq('ticket_id', ticket.id);
      
      if (ticketRides && ticketRides.length > 0) {
        const ridesWithNames = ticketRides.map(r => ({
          name: rideNames[r.ride_id] || 'Ride',
          quantity: r.quantity,
          total_price: Number(r.total_price),
        }));
        setSelectedTicket(prev => prev ? { ...prev, _rides: ridesWithNames } as any : prev);
      }
    } catch (e) {
      // Ignore — print without rides
    }
    setPrintOpen(true);
  };

  const handleSendSMS = async (ticket: TicketType) => {
    setSendingSMS(ticket.id);
    try {
      const message = `Baby World Ticket: ${ticket.ticket_number}\nDate: ${ticket.slot_date}\nTime: ${ticket.time_slot || 'Any'}\nThank you!`;

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phone: ticket.guardian_phone, message }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('SMS sent successfully');
      } else {
        toast.warning('SMS could not be sent (credentials not configured)');
      }
    } catch (err) {
      console.error('SMS error:', err);
      toast.error('Failed to send SMS');
    } finally {
      setSendingSMS(null);
    }
  };

  const handleGateEntry = async (ticket: TicketType) => {
    setGateActionLoading(ticket.id);
    try {
      const { data, error } = await supabase.functions.invoke('gate-scan', {
        body: {
          action: 'entry',
          ticket_id: ticket.id,
          gate_id: 'main_gate',
          staff_name: 'Admin'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Entry logged successfully');
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, inside_venue: true, status: 'used' as const, used_at: new Date().toISOString() } : t
      ));
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Entry failed');
    } finally {
      setGateActionLoading(null);
    }
  };

  const handleGateExit = async (ticket: TicketType) => {
    setGateActionLoading(ticket.id);
    try {
      const { data, error } = await supabase.functions.invoke('gate-scan', {
        body: {
          action: 'exit',
          ticket_id: ticket.id,
          gate_id: 'main_gate',
          staff_name: 'Admin'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Exit logged successfully');
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, inside_venue: false } : t
      ));
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Exit failed');
    } finally {
      setGateActionLoading(null);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!ticket.ticket_number.toLowerCase().includes(query) &&
          !ticket.guardian_name.toLowerCase().includes(query) &&
          !ticket.guardian_phone.includes(query)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (dateFrom) {
      if (ticket.slot_date < format(dateFrom, 'yyyy-MM-dd')) return false;
    }
    if (dateTo) {
      if (ticket.slot_date > format(dateTo, 'yyyy-MM-dd')) return false;
    }
    return true;
  });

  // Customer summary when searching by phone
  const isPhoneSearch = /^(\+?880|0)?1[3-9]\d{4,8}$/.test(searchQuery.trim());
  const customerSummary = useMemo(() => {
    if (!isPhoneSearch || !searchQuery.trim()) return null;
    const phoneTickets = tickets.filter(t => t.guardian_phone.includes(searchQuery.trim()));
    if (phoneTickets.length === 0) return null;
    const totalVisits = phoneTickets.length;
    const totalSpent = phoneTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);
    const lastVisit = phoneTickets[0]?.slot_date;
    const customerName = phoneTickets[0]?.guardian_name || 'Unknown';
    const activeTickets = phoneTickets.filter(t => t.status === 'active').length;
    const cancelledTickets = phoneTickets.filter(t => t.status === 'cancelled').length;
    return { totalVisits, totalSpent, lastVisit, customerName, activeTickets, cancelledTickets, phone: searchQuery.trim() };
  }, [isPhoneSearch, searchQuery, tickets]);

  // Paginated tickets
  const paginatedTickets = filteredTickets.slice(0, displayCount);
  const hasMore = filteredTickets.length > displayCount;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'used':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Used</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (ticket: TicketType) => {
    const type = ticket.payment_type || 'cash';
    const status = ticket.payment_status || 'unpaid';
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="capitalize text-xs w-fit">
          <CreditCard className="w-3 h-3 mr-1" />
          {type}
        </Badge>
        <Badge className={`text-xs w-fit ${status === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
          {status === 'paid' ? 'Paid' : 'Unpaid'}
        </Badge>
      </div>
    );
  };

  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    try {
      return format(parseISO(isoString), 'hh:mm a');
    } catch {
      return null;
    }
  };

  const activeCount = tickets.filter(t => t.status === 'active').length;
  const usedCount = tickets.filter(t => t.status === 'used').length;
  const todayCount = tickets.filter(t => t.slot_date === format(new Date(), 'yyyy-MM-dd')).length;
  const insideCount = tickets.filter(t => t.inside_venue).length;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setDisplayCount(PAGE_SIZE);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            Ticketing
          </h1>
          <p className="text-muted-foreground">Manage tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <QRScannerDialog />
        </div>
      </div>

      {activeView === 'create' ? (
        <CounterTicketForm onSuccess={handleTicketCreated} />
      ) : (
        <div className="space-y-6">
          {/* Stats Cards - 4 columns */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Tickets</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Today's Tickets</CardDescription>
                  <CardTitle className="text-2xl">{todayCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Inside Venue
                  </CardDescription>
                  <CardTitle className="text-2xl text-primary">{insideCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Used</CardDescription>
                  <CardTitle className="text-2xl text-muted-foreground">{usedCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CardTitle>Ticket List</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredTickets.length}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ticket #, name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {dateFrom ? format(dateFrom, 'dd MMM') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={dateFrom} 
                      onSelect={setDateFrom}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {dateTo ? format(dateTo, 'dd MMM') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={dateTo} 
                      onSelect={setDateTo}
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Summary */}
              {customerSummary && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{customerSummary.customerName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{customerSummary.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Visits</p>
                      <p className="font-bold text-lg">{customerSummary.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total Spent</p>
                      <p className="font-bold text-lg">৳{customerSummary.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Last Visit</p>
                      <p className="font-medium">{customerSummary.lastVisit ? format(new Date(customerSummary.lastVisit), 'dd MMM yyyy') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Active / Cancelled</p>
                      <p className="font-medium">{customerSummary.activeTickets} / {customerSummary.cancelledTickets}</p>
                    </div>
                  </div>
                </div>
              )}
              {error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive">{error}</p>
                  <Button onClick={fetchTickets} className="mt-4" size="sm">Try Again</Button>
                </div>
              ) : loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                  </tbody>
                </Table>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket #</TableHead>
                          <TableHead>Guardian</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="hidden md:table-cell">Payment</TableHead>
                          <TableHead className="hidden md:table-cell">Time</TableHead>
                          <TableHead className="hidden lg:table-cell">Discount</TableHead>
                          <TableHead className="hidden lg:table-cell">Source</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                            <TableCell>
                              <div className="font-medium">{ticket.guardian_name}</div>
                              <div className="text-sm text-muted-foreground">{ticket.guardian_phone}</div>
                            </TableCell>
                            <TableCell>
                              {format(parseISO(ticket.slot_date), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">৳{ticket.total_price || 0}</div>
                              {ticket.entry_price && ticket.entry_price > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  এন্ট্রি: ৳{ticket.entry_price}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getPaymentBadge(ticket)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-xs space-y-0.5">
                                {formatTime(ticket.in_time) && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <DoorOpen className="w-3 h-3" />
                                    {formatTime(ticket.in_time)}
                                  </div>
                                )}
                                {formatTime(ticket.out_time) && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <DoorClosed className="w-3 h-3" />
                                    {formatTime(ticket.out_time)}
                                  </div>
                                )}
                                {!formatTime(ticket.in_time) && !formatTime(ticket.out_time) && (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {ticket.discount_applied && ticket.discount_applied > 0 ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  -৳{ticket.discount_applied}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline" className="capitalize">{ticket.source}</Badge>
                            </TableCell>
                            <TableCell>
                              {ticket.inside_venue ? (
                                <Badge className="bg-primary/10 text-primary">
                                  <DoorOpen className="w-3 h-3 mr-1" />
                                  Inside
                                </Badge>
                              ) : ticket.status === 'used' ? (
                                <Badge variant="secondary">
                                  <DoorClosed className="w-3 h-3 mr-1" />
                                  Exited
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 flex-wrap">
                                {ticket.status !== 'cancelled' && (
                                  <>
                                    {!ticket.inside_venue && ticket.status === 'active' && (
                                      <Button 
                                        size="sm" 
                                        variant="default"
                                        onClick={() => handleGateEntry(ticket)}
                                        disabled={gateActionLoading === ticket.id}
                                        title="Gate Entry"
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {gateActionLoading === ticket.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <DoorOpen className="w-3 h-3 mr-1" />
                                            Entry
                                          </>
                                        )}
                                      </Button>
                                    )}
                                    {ticket.inside_venue && (
                                      <Button 
                                        size="sm" 
                                        variant="default"
                                        onClick={() => handleGateExit(ticket)}
                                        disabled={gateActionLoading === ticket.id}
                                        title="Gate Exit"
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        {gateActionLoading === ticket.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <DoorClosed className="w-3 h-3 mr-1" />
                                            Exit
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </>
                                )}

                                <Button size="sm" variant="ghost" onClick={() => handlePrintTicket(ticket)} title="Print">
                                  <Printer className="w-3 h-3" />
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleSendSMS(ticket)}
                                  disabled={sendingSMS === ticket.id}
                                  title="Send SMS"
                                >
                                  {sendingSMS === ticket.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <MessageSquare className="w-3 h-3" />
                                  )}
                                </Button>
                                
                                {ticket.status === 'active' && !ticket.inside_venue && (
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancelTicket(ticket.id)}>
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination footer */}
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>
                      Showing {paginatedTickets.length} of {filteredTickets.length} tickets
                    </span>
                    {hasMore && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
                      >
                        Show more
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print Ticket
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <PrintableTicket
              ticket={{
                ticketNumber: selectedTicket.ticket_number,
                guardianName: selectedTicket.guardian_name,
                guardianPhone: selectedTicket.guardian_phone,
                childName: selectedTicket.child_name || undefined,
                slotDate: selectedTicket.slot_date,
                timeSlot: selectedTicket.time_slot || '-',
                ticketType: selectedTicket.ticket_type,
                source: selectedTicket.source,
                createdAt: selectedTicket.created_at,
                entryPrice: selectedTicket.entry_price || undefined,
                socksPrice: selectedTicket.socks_price || undefined,
                addonsPrice: selectedTicket.addons_price || undefined,
                discountApplied: selectedTicket.discount_applied || undefined,
                totalPrice: selectedTicket.total_price || undefined,
                guardianCount: selectedTicket.guardian_count || undefined,
                childCount: selectedTicket.child_count || undefined,
                socksCount: selectedTicket.socks_count || undefined,
                inTime: selectedTicket.in_time || undefined,
                outTime: selectedTicket.out_time || undefined,
                paymentType: selectedTicket.payment_type || undefined,
                paymentStatus: selectedTicket.payment_status || undefined,
                rides: (selectedTicket as any)._rides || undefined,
              }}
              onClose={() => setPrintOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <TicketSuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        ticket={createdTicket}
        rideNames={rideNames}
      />
    </div>
  );
}
