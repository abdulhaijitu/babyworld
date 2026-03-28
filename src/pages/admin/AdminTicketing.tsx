import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  Users,
  ArrowUp
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { PrintableTicket } from '@/components/admin/PrintableTicket';
import { QRScannerDialog } from '@/components/admin/QRScannerDialog';



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
  const navigate = useNavigate();
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
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <TooltipProvider>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-center lg:justify-end gap-2">
          <Button size="sm" onClick={() => navigate('/admin/create-ticket')}>
            <Plus className="w-4 h-4 mr-1" />
            Create Ticket
          </Button>
          <QRScannerDialog />
      </div>

        <div className="space-y-4">
          {/* Stats Cards - compact */}
          {loading ? (
            <div className="grid grid-cols-4 gap-2 lg:gap-3">
              {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 lg:gap-3">
              <Card>
                <CardHeader className="p-2 pb-1 lg:p-3 lg:pb-2">
                  <CardDescription className="flex items-center gap-1 text-[10px] lg:text-xs">
                    <CheckCircle className="w-3 h-3" /> Active
                  </CardDescription>
                  <CardTitle className="text-lg lg:text-xl text-green-600">{activeCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-2 pb-1 lg:p-3 lg:pb-2">
                  <CardDescription className="flex items-center gap-1 text-[10px] lg:text-xs">
                    <CalendarDays className="w-3 h-3" /> Today
                  </CardDescription>
                  <CardTitle className="text-lg lg:text-xl">{todayCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/30">
                <CardHeader className="p-2 pb-1 lg:p-3 lg:pb-2">
                  <CardDescription className="flex items-center gap-1 text-[10px] lg:text-xs">
                    <Users className="w-3 h-3" /> Inside
                  </CardDescription>
                  <CardTitle className="text-lg lg:text-xl text-primary">{insideCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-2 pb-1 lg:p-3 lg:pb-2">
                  <CardDescription className="flex items-center gap-1 text-[10px] lg:text-xs">
                    <Clock className="w-3 h-3" /> Used
                  </CardDescription>
                  <CardTitle className="text-lg lg:text-xl text-muted-foreground">{usedCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Tickets Table */}
          <Card>
            <CardHeader className="p-3 pb-2">
              {/* Filters - no duplicate title */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[140px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[80px] h-9 text-xs">
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
                    <Button variant="outline" size="sm" className="h-9 px-2 min-w-[70px] text-xs">
                      <CalendarDays className="w-3 h-3 mr-1" />
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
                    <Button variant="outline" size="sm" className="h-9 px-2 min-w-[70px] text-xs">
                      <CalendarDays className="w-3 h-3 mr-1" />
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
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  <Badge variant="secondary" className="text-xs">
                    {filteredTickets.length}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchTickets} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              {/* Customer Summary - compact */}
              {customerSummary && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-sm">{customerSummary.customerName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{customerSummary.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Visits</p>
                      <p className="font-bold">{customerSummary.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Spent</p>
                      <p className="font-bold">৳{customerSummary.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Last Visit</p>
                      <p className="font-medium text-xs">{customerSummary.lastVisit ? format(new Date(customerSummary.lastVisit), 'dd MMM yyyy') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Active / Cancel</p>
                      <p className="font-medium">{customerSummary.activeTickets} / {customerSummary.cancelledTickets}</p>
                    </div>
                  </div>
                </div>
              )}
              {error ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                  <Button onClick={fetchTickets} className="mt-3" size="sm">Try Again</Button>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No tickets found</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-2">
                    {paginatedTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-lg border bg-card p-3 space-y-2">
                        {/* Header: Ticket# + Status */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-medium">{ticket.ticket_number}</span>
                          <div className="flex items-center gap-1.5">
                            {getStatusBadge(ticket.status)}
                            {ticket.inside_venue && (
                              <Badge className="bg-primary/10 text-primary text-xs">
                                <DoorOpen className="w-2.5 h-2.5 mr-0.5" />Inside
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Body: Info */}
                        <div className="text-sm space-y-0.5">
                          <div className="font-medium">{ticket.guardian_name} · <span className="text-muted-foreground font-normal">{ticket.guardian_phone}</span></div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(parseISO(ticket.slot_date), 'dd MMM yyyy')}</span>
                            <span>·</span>
                            <span className="font-semibold text-foreground">৳{ticket.total_price || 0}</span>
                            {(ticket.discount_applied ?? 0) > 0 && (
                              <span className="text-green-600">-৳{ticket.discount_applied}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize text-xs h-5">
                              <CreditCard className="w-2.5 h-2.5 mr-0.5" />{ticket.payment_type || 'cash'}
                            </Badge>
                            <Badge className={`text-xs h-5 ${(ticket.payment_status || 'unpaid') === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {(ticket.payment_status || 'unpaid') === 'paid' ? 'Paid' : 'Unpaid'}
                            </Badge>
                            {formatTime(ticket.in_time) && (
                              <span className="flex items-center gap-0.5 text-green-600">
                                <DoorOpen className="w-3 h-3" />{formatTime(ticket.in_time)}
                              </span>
                            )}
                            {formatTime(ticket.out_time) && (
                              <span className="flex items-center gap-0.5 text-orange-600">
                                <DoorClosed className="w-3 h-3" />{formatTime(ticket.out_time)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 pt-1 border-t">
                          {ticket.status !== 'cancelled' && (
                            <>
                              {!ticket.inside_venue && ticket.status === 'active' && (
                                <Button 
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-xs gap-1"
                                  onClick={() => handleGateEntry(ticket)}
                                  disabled={gateActionLoading === ticket.id}
                                >
                                  {gateActionLoading === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <DoorOpen className="w-3.5 h-3.5" />}
                                  Entry
                                </Button>
                              )}
                              {ticket.inside_venue && (
                                <Button 
                                  size="sm"
                                  className="h-8 bg-orange-600 hover:bg-orange-700 text-xs gap-1"
                                  onClick={() => handleGateExit(ticket)}
                                  disabled={gateActionLoading === ticket.id}
                                >
                                  {gateActionLoading === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <DoorClosed className="w-3.5 h-3.5" />}
                                  Exit
                                </Button>
                              )}
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handlePrintTicket(ticket)}>
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon" variant="ghost" className="h-8 w-8"
                            onClick={() => handleSendSMS(ticket)}
                            disabled={sendingSMS === ticket.id}
                          >
                            {sendingSMS === ticket.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                          </Button>
                          {ticket.status === 'active' && !ticket.inside_venue && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleCancelTicket(ticket.id)}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead className="py-2 px-3">Ticket #</TableHead>
                          <TableHead className="py-2 px-3">Guardian</TableHead>
                          <TableHead className="py-2 px-3">Date</TableHead>
                          <TableHead className="py-2 px-3">Price</TableHead>
                          <TableHead className="py-2 px-3">Payment</TableHead>
                          <TableHead className="py-2 px-3">Time</TableHead>
                          <TableHead className="py-2 px-3">Source</TableHead>
                          <TableHead className="py-2 px-3">Status</TableHead>
                          <TableHead className="py-2 px-3 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="text-sm">
                            <TableCell className="py-2 px-3 font-mono text-xs">{ticket.ticket_number}</TableCell>
                            <TableCell className="py-2 px-3">
                              <div className="font-medium text-sm leading-tight">{ticket.guardian_name}</div>
                              <div className="text-xs text-muted-foreground">{ticket.guardian_phone}</div>
                            </TableCell>
                            <TableCell className="py-2 px-3 text-xs">
                              {format(parseISO(ticket.slot_date), 'dd MMM')}
                            </TableCell>
                            <TableCell className="py-2 px-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-default">
                                    <div className="font-medium text-sm">৳{ticket.total_price || 0}</div>
                                    {ticket.discount_applied && ticket.discount_applied > 0 && (
                                      <span className="text-xs text-green-600">-৳{ticket.discount_applied}</span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  <div className="space-y-0.5">
                                    <div>Entry: ৳{ticket.entry_price || 0}</div>
                                    {(ticket.socks_price ?? 0) > 0 && <div>Socks: ৳{ticket.socks_price}</div>}
                                    {(ticket.addons_price ?? 0) > 0 && <div>Addons: ৳{ticket.addons_price}</div>}
                                    {(ticket.discount_applied ?? 0) > 0 && <div>Discount: -৳{ticket.discount_applied}</div>}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="py-2 px-3">
                              {getPaymentBadge(ticket)}
                            </TableCell>
                            <TableCell className="py-2 px-3">
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
                            <TableCell className="py-2 px-3">
                              <Badge variant="outline" className="capitalize text-xs">{ticket.source}</Badge>
                            </TableCell>
                            <TableCell className="py-2 px-3">
                              <div className="flex flex-col gap-1">
                                {getStatusBadge(ticket.status)}
                                {ticket.inside_venue ? (
                                  <Badge className="bg-primary/10 text-primary text-xs w-fit">
                                    <DoorOpen className="w-2.5 h-2.5 mr-0.5" />
                                    Inside
                                  </Badge>
                                ) : ticket.status === 'used' ? (
                                  <Badge variant="secondary" className="text-xs w-fit">
                                    <DoorClosed className="w-2.5 h-2.5 mr-0.5" />
                                    Exited
                                  </Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 px-3 text-right">
                              <div className="flex justify-end gap-0.5">
                                {ticket.status !== 'cancelled' && (
                                  <>
                                    {!ticket.inside_venue && ticket.status === 'active' && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            size="icon"
                                            variant="default"
                                            className="h-7 w-7 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleGateEntry(ticket)}
                                            disabled={gateActionLoading === ticket.id}
                                          >
                                            {gateActionLoading === ticket.id ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <DoorOpen className="w-3 h-3" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Entry</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {ticket.inside_venue && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            size="icon"
                                            variant="default"
                                            className="h-7 w-7 bg-orange-600 hover:bg-orange-700"
                                            onClick={() => handleGateExit(ticket)}
                                            disabled={gateActionLoading === ticket.id}
                                          >
                                            {gateActionLoading === ticket.id ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <DoorClosed className="w-3 h-3" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Exit</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </>
                                )}

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handlePrintTicket(ticket)}>
                                      <Printer className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Print</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => handleSendSMS(ticket)}
                                      disabled={sendingSMS === ticket.id}
                                    >
                                      {sendingSMS === ticket.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <MessageSquare className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>SMS</TooltipContent>
                                </Tooltip>
                                
                                {ticket.status === 'active' && !ticket.inside_venue && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleCancelTicket(ticket.id)}>
                                        <XCircle className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Cancel</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {paginatedTickets.length} of {filteredTickets.length}
                    </span>
                    {hasMore && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs"
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
      {/* Back to Top floating button - mobile only */}
      <AnimatePresence>
        {showTopButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 lg:hidden"
          >
            <Button
              size="icon"
              className="rounded-full shadow-lg h-10 w-10"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom spacer for mobile dock */}
      <div className="h-20 lg:hidden" />
    </div>
    </TooltipProvider>
  );
}
