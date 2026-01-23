import { useAdminBookings, Booking } from '@/hooks/useAdminBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  Loader2, 
  CalendarDays, 
  Users, 
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Phone,
  Ban,
  Undo2,
  Search,
  TrendingUp,
  Banknote,
  X,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { QuickActions } from '@/components/admin/QuickActions';
import { ActivityLogCard } from '@/components/admin/ActivityLogCard';
import { VisitorCounter } from '@/components/admin/VisitorCounter';

const PRICE_PER_TICKET = 300;

export default function AdminDashboardContent() {
  const { bookings, loading: bookingsLoading, error: bookingsError, refetch, updateBookingStatus, cancelBooking } = useAdminBookings();
  const { language } = useLanguage();
  
  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [withRefund, setWithRefund] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await refetch();
    setRetrying(false);
  }, [refetch]);

  const handleStatusChange = async (bookingId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    const success = await updateBookingStatus(bookingId, status);
    if (success) {
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } else {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setWithRefund(booking.payment_status === 'paid');
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setCancelling(true);
    const result = await cancelBooking(selectedBooking.id, withRefund, cancelReason);
    setCancelling(false);
    
    if (result?.success) {
      toast.success(language === 'bn' ? 'বুকিং বাতিল হয়েছে' : 'Booking cancelled');
      setCancelDialogOpen(false);
    } else {
      toast.error(language === 'bn' ? 'বাতিল ব্যর্থ হয়েছে' : 'Cancellation failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</Badge>;
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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        booking.parent_name.toLowerCase().includes(query) ||
        booking.parent_phone.includes(query) ||
        booking.time_slot.includes(query);
      if (!matchesSearch) return false;
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && booking.payment_status !== paymentFilter) return false;
    if (dateFilter) {
      const bookingDate = parseISO(booking.slot_date);
      if (format(bookingDate, 'yyyy-MM-dd') !== format(dateFilter, 'yyyy-MM-dd')) return false;
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

  // Stats calculations
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.slot_date === todayStr);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  
  const todayRevenue = todayBookings.filter(b => b.payment_status === 'paid').length * PRICE_PER_TICKET;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const weeklyBookings = bookings.filter(b => {
    const bookingDate = parseISO(b.slot_date);
    return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd }) && b.payment_status === 'paid';
  });
  const weeklyRevenue = weeklyBookings.length * PRICE_PER_TICKET;
  
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthlyBookings = bookings.filter(b => {
    const bookingDate = parseISO(b.slot_date);
    return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd }) && b.payment_status === 'paid';
  });
  const monthlyRevenue = monthlyBookings.length * PRICE_PER_TICKET;
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
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold">
          {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'bn' ? 'আজকের সারসংক্ষেপ এবং বুকিং' : "Today's overview and bookings"}
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardDescription>{language === 'bn' ? 'এই সপ্তাহে' : 'This Week'}</CardDescription>
            <CardTitle className="text-2xl">৳{weeklyRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              {weeklyBookings.length} {language === 'bn' ? 'টি বুকিং' : 'bookings'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'এই মাসে' : 'This Month'}</CardDescription>
            <CardTitle className="text-2xl">৳{monthlyRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground text-sm">
              <CalendarDays className="w-4 h-4 mr-1" />
              {monthlyBookings.length} {language === 'bn' ? 'টি বুকিং' : 'bookings'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'মোট আয়' : 'Total Revenue'}</CardDescription>
            <CardTitle className="text-2xl">৳{totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground text-sm">
              <CreditCard className="w-4 h-4 mr-1" />
              {paidBookings.length} {language === 'bn' ? 'টি পেমেন্ট' : 'total paid'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions, Visitor Counter and Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <QuickActions />
        <VisitorCounter />
        <div className="lg:col-span-2">
          <ActivityLogCard />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}</CardDescription>
            <CardTitle className="text-2xl">{bookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের বুকিং' : "Today's"}</CardDescription>
            <CardTitle className="text-2xl">{todayBookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{confirmedBookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'পেমেন্ট সম্পন্ন' : 'Paid'}</CardDescription>
            <CardTitle className="text-2xl text-primary">{paidBookings.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{language === 'bn' ? 'সাম্প্রতিক বুকিং' : 'Recent Bookings'}</CardTitle>
              <CardDescription>
                {filteredBookings.length} {language === 'bn' ? 'টি বুকিং' : 'bookings'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={bookingsLoading || retrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${(bookingsLoading || retrying) ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'সার্চ করুন...' : 'Search...'}
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
            
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {bookingsError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-medium mb-2">{language === 'bn' ? 'ডেটা লোড ব্যর্থ' : 'Failed to load'}</p>
              <Button onClick={handleRetry} disabled={retrying} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
              </Button>
            </div>
          ) : bookingsLoading ? (
            <div className="overflow-x-auto">
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
                  {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                </tbody>
              </Table>
            </div>
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
                    <TableHead>{language === 'bn' ? 'ফোন' : 'Phone'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.slice(0, 10).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(parseISO(booking.slot_date), 'dd MMM yyyy', { 
                            locale: language === 'bn' ? bn : undefined 
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">{booking.time_slot}</div>
                      </TableCell>
                      <TableCell className="font-medium">{booking.parent_name}</TableCell>
                      <TableCell>
                        <a href={`tel:${booking.parent_phone}`} className="text-primary hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.parent_phone}
                        </a>
                      </TableCell>
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
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              disabled={booking.status === 'confirmed'}
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

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
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
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {language === 'bn' ? 'না' : 'No'}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={cancelling}>
              {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'বাতিল করুন' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
