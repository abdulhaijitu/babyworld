import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  CalendarDays,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Ban,
  Undo2,
  X,
  Eye,
  Ticket,
  TrendingUp,
  Banknote,
  Filter,
  Plus,
  Printer,
  MessageSquare,
  Calendar as CalendarIcon,
  List,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { bn } from 'date-fns/locale';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { ManualBookingForm } from '@/components/admin/bookings/ManualBookingForm';
import { BookingPrintTicket } from '@/components/admin/bookings/BookingPrintTicket';
import { BookingCalendarView } from '@/components/admin/bookings/BookingCalendarView';
import { useSendSMS } from '@/hooks/useSendSMS';
import { BookingExport } from '@/components/admin/bookings/BookingExport';
import { PaymentCollectionDialog } from '@/components/admin/bookings/PaymentCollectionDialog';
import { TodayBookingSummary } from '@/components/admin/bookings/TodayBookingSummary';

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  ticket_type: 'child_guardian' | 'child_only' | 'group';
  booking_type: 'hourly_play' | 'birthday_event' | 'private_event';
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: string;
  notes: string | null;
  created_at: string;
}

const PRICE_PER_TICKET = 300;

export default function AdminBookings() {
  const { language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  
  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [withRefund, setWithRefund] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Manual booking dialog
  const [manualBookingOpen, setManualBookingOpen] = useState(false);

  // Print ticket dialog
  const [printOpen, setPrintOpen] = useState(false);
  const [printBooking, setPrintBooking] = useState<Booking | null>(null);

  // SMS & WhatsApp functionality
  const { sending: sendingSMS, sendBookingConfirmation, openWhatsApp } = useSendSMS();

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Payment collection dialog
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('slot_date', { ascending: false })
        .order('time_slot', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings((data || []) as Booking[]);
    } catch (err: any) {
      console.error('[Bookings] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, status: 'confirmed' | 'pending') => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (updateError) throw updateError;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch (err) {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setWithRefund(booking.payment_status === 'paid');
    setCancelOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      const updates: any = { status: 'cancelled' };
      if (withRefund) {
        updates.payment_status = 'refunded';
      }
      if (cancelReason) {
        updates.notes = `${selectedBooking.notes || ''}\n[Cancelled: ${cancelReason}]`.trim();
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', selectedBooking.id);

      if (updateError) throw updateError;

      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? { ...b, ...updates } : b
      ));
      toast.success(language === 'bn' ? 'বুকিং বাতিল হয়েছে' : 'Booking cancelled');
      setCancelOpen(false);
    } catch (err) {
      toast.error(language === 'bn' ? 'বাতিল ব্যর্থ' : 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  const openDetailDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const openPrintDialog = (booking: Booking) => {
    setPrintBooking(booking);
    setPrintOpen(true);
  };

  const handleSendSMS = async (booking: Booking) => {
    const bookingRef = `BK${booking.id.slice(0, 8).toUpperCase()}`;
    const formattedDate = format(parseISO(booking.slot_date), 'dd MMM yyyy');
    
    await sendBookingConfirmation(
      booking.parent_phone,
      booking.parent_name,
      formattedDate,
      booking.time_slot,
      bookingRef
    );
  };

  const handleWhatsApp = (booking: Booking) => {
    const bookingRef = `BK${booking.id.slice(0, 8).toUpperCase()}`;
    const formattedDate = format(parseISO(booking.slot_date), 'dd MMM yyyy');
    
    openWhatsApp(
      booking.parent_phone,
      booking.parent_name,
      formattedDate,
      booking.time_slot,
      bookingRef
    );
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!booking.parent_name.toLowerCase().includes(query) &&
          !booking.parent_phone.includes(query)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && booking.payment_status !== paymentFilter) return false;
    if (dateFilter) {
      if (booking.slot_date !== format(dateFilter, 'yyyy-MM-dd')) return false;
    }
    if (dateRangeFilter !== 'all') {
      const bookingDate = parseISO(booking.slot_date);
      const today = new Date();
      if (dateRangeFilter === 'today') {
        if (format(bookingDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
      } else if (dateRangeFilter === 'week') {
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        if (!isWithinInterval(bookingDate, { start: weekStart, end: weekEnd })) return false;
      } else if (dateRangeFilter === 'month') {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        if (!isWithinInterval(bookingDate, { start: monthStart, end: monthEnd })) return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'বাতিল' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'পরিশোধিত' : 'Paid'}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'ব্যর্থ' : 'Failed'}</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="text-blue-600"><Undo2 className="w-3 h-3 mr-1" /> {language === 'bn' ? 'রিফান্ড' : 'Refunded'}</Badge>;
      default:
        return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}</Badge>;
    }
  };

  const getTicketTypeBadge = (type: string) => {
    switch (type) {
      case 'child_guardian':
        return <Badge variant="outline">{language === 'bn' ? 'শিশু + অভিভাবক' : 'Child + Guardian'}</Badge>;
      case 'child_only':
        return <Badge variant="outline">{language === 'bn' ? 'শুধু শিশু' : 'Child Only'}</Badge>;
      case 'group':
        return <Badge variant="outline">{language === 'bn' ? 'গ্রুপ' : 'Group'}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Stats
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.slot_date === todayStr);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const todayRevenue = todayBookings.filter(b => b.payment_status === 'paid').length * PRICE_PER_TICKET;
  const totalRevenue = paidBookings.length * PRICE_PER_TICKET;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFilter(undefined);
    setDateRangeFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter || dateRangeFilter !== 'all';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            {language === 'bn' ? 'বুকিং ম্যানেজমেন্ট' : 'Bookings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সকল বুকিং দেখুন ও পরিচালনা করুন' : 'View and manage all bookings'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="gap-1">
                <List className="w-4 h-4" />
                {language === 'bn' ? 'তালিকা' : 'List'}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1">
                <CalendarIcon className="w-4 h-4" />
                {language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={() => setManualBookingOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'bn' ? 'নতুন বুকিং' : 'New Booking'}
          </Button>
          <BookingExport bookings={filteredBookings} />
          <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের আয়' : "Today's Revenue"}</CardDescription>
            <CardTitle className="text-2xl">৳{todayRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground text-sm">
              <Banknote className="w-4 h-4 mr-1" />
              {todayBookings.filter(b => b.payment_status === 'paid').length} {language === 'bn' ? 'টি পেমেন্ট' : 'payments'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}</CardDescription>
            <CardTitle className="text-2xl">{bookings.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের বুকিং' : "Today's Bookings"}</CardDescription>
            <CardTitle className="text-2xl">{todayBookings.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'মোট আয়' : 'Total Revenue'}</CardDescription>
            <CardTitle className="text-2xl">৳{totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              {paidBookings.length} {language === 'bn' ? 'টি পেমেন্ট' : 'paid'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Booking Summary */}
      <TodayBookingSummary bookings={bookings} />

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <BookingCalendarView 
          bookings={bookings} 
          onBookingSelect={(booking) => openDetailDialog(booking)}
        />
      )}

      {/* Bookings Table - List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>{language === 'bn' ? 'বুকিং তালিকা' : 'Booking List'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredBookings.length} {language === 'bn' ? 'টি বুকিং' : 'bookings'}
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'নাম বা ফোন...' : 'Name or phone...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full md:w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব সময়' : 'All Time'}</SelectItem>
                  <SelectItem value="today">{language === 'bn' ? 'আজ' : 'Today'}</SelectItem>
                  <SelectItem value="week">{language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</SelectItem>
                  <SelectItem value="month">{language === 'bn' ? 'এই মাস' : 'This Month'}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                  <SelectItem value="confirmed">{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</SelectItem>
                  <SelectItem value="pending">{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</SelectItem>
                  <SelectItem value="paid">{language === 'bn' ? 'পেইড' : 'Paid'}</SelectItem>
                  <SelectItem value="unpaid">{language === 'bn' ? 'আনপেইড' : 'Unpaid'}</SelectItem>
                  <SelectItem value="refunded">{language === 'bn' ? 'রিফান্ড' : 'Refunded'}</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {dateFilter ? format(dateFilter, 'dd MMM') : (language === 'bn' ? 'তারিখ' : 'Date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} />
                </PopoverContent>
              </Popover>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchBookings} className="mt-4" size="sm">
                  {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                </Button>
              </div>
            ) : loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{language === 'bn' ? 'অভিভাবক' : 'Parent'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} />)}
                </tbody>
              </Table>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings found'}</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    {language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear filters'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</TableHead>
                      <TableHead>{language === 'bn' ? 'অভিভাবক' : 'Parent'}</TableHead>
                      <TableHead>{language === 'bn' ? 'টিকেট' : 'Ticket'}</TableHead>
                      <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {format(parseISO(booking.slot_date), 'dd MMM yyyy', { 
                              locale: language === 'bn' ? bn : undefined 
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">{booking.time_slot}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.parent_name}</div>
                          <a href={`tel:${booking.parent_phone}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.parent_phone}
                          </a>
                        </TableCell>
                        <TableCell>{getTicketTypeBadge(booking.ticket_type)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(booking)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'বিস্তারিত' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPrintDialog(booking)}>
                                <Printer className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'প্রিন্ট' : 'Print Ticket'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSendSMS(booking)}
                                disabled={sendingSMS || booking.status === 'cancelled'}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'SMS পাঠান' : 'Send SMS'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleWhatsApp(booking)}
                                disabled={booking.status === 'cancelled'}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'WhatsApp' : 'WhatsApp'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setPaymentBooking(booking);
                                  setPaymentOpen(true);
                                }}
                                disabled={booking.payment_status === 'paid' || booking.status === 'cancelled'}
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'পেমেন্ট নিন' : 'Collect Payment'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                disabled={booking.status === 'confirmed' || booking.status === 'cancelled'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openCancelDialog(booking)}
                                disabled={booking.status === 'cancelled'}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
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
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'বুকিং বিস্তারিত' : 'Booking Details'}</DialogTitle>
            <DialogDescription>
              {selectedBooking && format(parseISO(selectedBooking.slot_date), 'EEEE, dd MMMM yyyy', { locale: language === 'bn' ? bn : undefined })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking.payment_status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'অভিভাবক' : 'Parent'}</Label>
                  <p className="font-medium">{selectedBooking.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                  <p className="font-medium">{selectedBooking.parent_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'সময়' : 'Time Slot'}</Label>
                  <p className="font-medium">{selectedBooking.time_slot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'টিকেট টাইপ' : 'Ticket Type'}</Label>
                  <div className="mt-1">{getTicketTypeBadge(selectedBooking.ticket_type)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বুকিং টাইপ' : 'Booking Type'}</Label>
                  <Badge variant="outline" className="mt-1 capitalize">{selectedBooking.booking_type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বুক করা হয়েছে' : 'Booked On'}</Label>
                  <p className="font-medium text-sm">
                    {format(parseISO(selectedBooking.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              {language === 'bn' ? 'বুকিং বাতিল করুন' : 'Cancel Booking'}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.parent_name} - {selectedBooking?.slot_date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কারণ' : 'Reason'}</Label>
              <Textarea
                placeholder={language === 'bn' ? 'কারণ লিখুন (ঐচ্ছিক)' : 'Enter reason (optional)'}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            
            {selectedBooking?.payment_status === 'paid' && (
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="refund"
                  checked={withRefund}
                  onCheckedChange={(checked) => setWithRefund(checked as boolean)}
                />
                <Label htmlFor="refund" className="flex items-center gap-2 cursor-pointer">
                  <Undo2 className="w-4 h-4" />
                  {language === 'bn' ? 'রিফান্ড করুন' : 'Process Refund'}
                </Label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              {language === 'bn' ? 'না' : 'No'}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling}>
              {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'বাতিল করুন' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Booking Dialog */}
      <Dialog open={manualBookingOpen} onOpenChange={setManualBookingOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {language === 'bn' ? 'ম্যানুয়াল বুকিং' : 'Manual Booking'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'কাউন্টার থেকে নতুন বুকিং তৈরি করুন' : 'Create a new booking from the counter'}
            </DialogDescription>
          </DialogHeader>
          <ManualBookingForm 
            onSuccess={() => {
              setManualBookingOpen(false);
              fetchBookings();
            }}
            onCancel={() => setManualBookingOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Print Ticket Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              {language === 'bn' ? 'টিকেট প্রিন্ট করুন' : 'Print Ticket'}
            </DialogTitle>
          </DialogHeader>
          {printBooking && (
            <BookingPrintTicket 
              booking={printBooking}
              onClose={() => setPrintOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Collection Dialog */}
      <PaymentCollectionDialog
        booking={paymentBooking}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={fetchBookings}
      />
    </div>
  );
}
