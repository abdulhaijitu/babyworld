import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  LogOut, 
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
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { bn } from 'date-fns/locale';
import babyWorldLogo from '@/assets/baby-world-logo.png';
import { AdminDashboardSkeleton, TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { AdminErrorState } from '@/components/admin/AdminErrorState';

const PRICE_PER_TICKET = 300;

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, error: authError, signOut } = useAuth();
  const { bookings, loading: bookingsLoading, error: bookingsError, refetch, updateBookingStatus, cancelBooking } = useAdminBookings();
  const navigate = useNavigate();
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

  // Retrying state
  const [retrying, setRetrying] = useState(false);

  // Handle retry for data fetch errors
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await refetch();
    setRetrying(false);
  }, [refetch]);

  // Redirect to login if not authenticated (only after auth loading completes)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  // Show error toast if user is not admin (but only after auth loading)
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      toast.error(language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস নেই' : 'No admin access');
    }
  }, [isAdmin, authLoading, user, language]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

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
      if (result.refund) {
        toast.info(language === 'bn' ? 'রিফান্ড প্রক্রিয়াধীন' : 'Refund processing required');
      }
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
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        booking.parent_name.toLowerCase().includes(query) ||
        booking.parent_phone.includes(query) ||
        booking.time_slot.includes(query);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    
    // Payment filter
    if (paymentFilter !== 'all' && booking.payment_status !== paymentFilter) return false;
    
    // Date filter
    if (dateFilter) {
      const bookingDate = parseISO(booking.slot_date);
      if (format(bookingDate, 'yyyy-MM-dd') !== format(dateFilter, 'yyyy-MM-dd')) return false;
    }
    
    // Date range filter
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
  
  // Revenue calculations
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

  // Show skeleton while auth is loading
  if (authLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Show error state for auth errors
  if (authError) {
    return <AdminErrorState type="auth" message={authError} />;
  }

  // Show permission error if user exists but is not admin
  if (user && !isAdmin) {
    return <AdminErrorState type="permission" />;
  }

  // Show login required if no user
  if (!user) {
    return <AdminErrorState type="auth" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={babyWorldLogo} alt="Baby World" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-foreground">
                {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'bn' ? 'লগআউট' : 'Logout'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'আজকের আয়' : "Today's Revenue"}</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">৳{todayRevenue.toLocaleString()}</CardTitle>
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
              <CardTitle className="text-2xl md:text-3xl">৳{weeklyRevenue.toLocaleString()}</CardTitle>
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
              <CardTitle className="text-2xl md:text-3xl">৳{monthlyRevenue.toLocaleString()}</CardTitle>
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
              <CardTitle className="text-2xl md:text-3xl">৳{totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground text-sm">
                <CreditCard className="w-4 h-4 mr-1" />
                {paidBookings.length} {language === 'bn' ? 'টি পেমেন্ট' : 'total paid'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{bookings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground text-sm">
                <CalendarDays className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'সব সময়' : 'All time'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'আজকের বুকিং' : "Today's Bookings"}</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{todayBookings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {format(new Date(), 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'নিশ্চিত বুকিং' : 'Confirmed'}</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-green-600">{confirmedBookings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground text-sm">
                <Users className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'সক্রিয়' : 'Active'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'পেমেন্ট সম্পন্ন' : 'Paid'}</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-primary">{paidBookings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground text-sm">
                <CreditCard className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'পরিশোধিত' : 'Completed'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{language === 'bn' ? 'সকল বুকিং' : 'All Bookings'}</CardTitle>
                <CardDescription>
                  {language === 'bn' 
                    ? `${filteredBookings.length}টি বুকিং দেখাচ্ছে`
                    : `Showing ${filteredBookings.length} bookings`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} disabled={bookingsLoading || retrying}>
                <RefreshCw className={`w-4 h-4 mr-2 ${(bookingsLoading || retrying) ? 'animate-spin' : ''}`} />
                {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
              </Button>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'নাম বা ফোন দিয়ে সার্চ করুন...' : 'Search by name or phone...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Date Range Filter */}
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder={language === 'bn' ? 'সময়কাল' : 'Time Period'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব সময়' : 'All Time'}</SelectItem>
                  <SelectItem value="today">{language === 'bn' ? 'আজ' : 'Today'}</SelectItem>
                  <SelectItem value="week">{language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</SelectItem>
                  <SelectItem value="month">{language === 'bn' ? 'এই মাস' : 'This Month'}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="confirmed">{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</SelectItem>
                  <SelectItem value="pending">{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Payment Filter */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder={language === 'bn' ? 'পেমেন্ট' : 'Payment'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব পেমেন্ট' : 'All Payments'}</SelectItem>
                  <SelectItem value="paid">{language === 'bn' ? 'পরিশোধিত' : 'Paid'}</SelectItem>
                  <SelectItem value="unpaid">{language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}</SelectItem>
                  <SelectItem value="pending">{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                  <SelectItem value="refunded">{language === 'bn' ? 'রিফান্ড' : 'Refunded'}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {dateFilter 
                      ? format(dateFilter, 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })
                      : (language === 'bn' ? 'তারিখ' : 'Date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                  />
                </PopoverContent>
              </Popover>
              
              {/* Clear Filters */}
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
                <p className="text-destructive font-medium mb-2">
                  {language === 'bn' ? 'ডেটা লোড করতে সমস্যা হয়েছে' : 'Failed to load data'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{bookingsError}</p>
                <Button onClick={handleRetry} disabled={retrying}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                  {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                </Button>
              </div>
            ) : bookingsLoading ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</TableHead>
                      <TableHead>{language === 'bn' ? 'অভিভাবক' : 'Parent'}</TableHead>
                      <TableHead>{language === 'bn' ? 'ফোন' : 'Phone'}</TableHead>
                      <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                      <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </tbody>
                </Table>
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  {language === 'bn' ? 'বুকিং ডেটা লোড হচ্ছে...' : 'Loading booking data...'}
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                      <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
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
                          <div className="text-sm text-muted-foreground">
                            {booking.time_slot}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.parent_name}</div>
                          {booking.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {booking.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`tel:${booking.parent_phone}`} 
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
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
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(booking.id, 'pending')}
                                disabled={booking.status === 'pending'}
                              >
                                <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                                {language === 'bn' ? 'অপেক্ষমাণ করুন' : 'Set Pending'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openCancelDialog(booking)}
                                disabled={booking.status === 'cancelled'}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'বাতিল ও রিফান্ড' : 'Cancel & Refund'}
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
      </main>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              {language === 'bn' ? 'বুকিং বাতিল করুন' : 'Cancel Booking'}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <span>
                  {selectedBooking.parent_name} - {selectedBooking.slot_date} ({selectedBooking.time_slot})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বাতিলের কারণ' : 'Cancellation Reason'}</Label>
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
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="refund" className="flex items-center gap-2 cursor-pointer">
                    <Undo2 className="w-4 h-4" />
                    {language === 'bn' ? 'রিফান্ড করুন' : 'Process Refund'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' 
                      ? 'পেমেন্ট গেটওয়ে থেকে ম্যানুয়াল রিফান্ড করতে হবে'
                      : 'Manual refund required via payment gateway'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {language === 'bn' ? 'না' : 'No'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
