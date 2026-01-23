import { useEffect, useState } from 'react';
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
  Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import babyWorldLogo from '@/assets/baby-world-logo.png';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { bookings, loading: bookingsLoading, error, refetch, updateBookingStatus, cancelBooking } = useAdminBookings();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [withRefund, setWithRefund] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      toast.error(language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস নেই' : 'No admin access');
      navigate('/');
    }
  }, [isAdmin, authLoading, user, navigate, language]);

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
      default:
        return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}</Badge>;
    }
  };

  // Stats calculations
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.slot_date === todayStr);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}</CardDescription>
              <CardTitle className="text-3xl">{bookings.length}</CardTitle>
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
              <CardTitle className="text-3xl">{todayBookings.length}</CardTitle>
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
              <CardTitle className="text-3xl text-green-600">{confirmedBookings.length}</CardTitle>
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
              <CardTitle className="text-3xl text-primary">{paidBookings.length}</CardTitle>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{language === 'bn' ? 'সকল বুকিং' : 'All Bookings'}</CardTitle>
              <CardDescription>
                {language === 'bn' 
                  ? 'সব বুকিং দেখুন এবং ম্যানেজ করুন'
                  : 'View and manage all bookings'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} disabled={bookingsLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${bookingsLoading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-destructive">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings yet'}</p>
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
                    {bookings.map((booking) => (
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
