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
import { 
  Plus,
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
  X,
  Eye,
  PartyPopper,
  Cake,
  Users,
  Gift,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
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

const eventPackages = [
  { id: 'basic', name: 'Basic', nameBn: 'বেসিক', price: 5000, guests: 10 },
  { id: 'standard', name: 'Standard', nameBn: 'স্ট্যান্ডার্ড', price: 8000, guests: 20 },
  { id: 'premium', name: 'Premium', nameBn: 'প্রিমিয়াম', price: 12000, guests: 30 },
  { id: 'deluxe', name: 'Deluxe', nameBn: 'ডিলাক্স', price: 18000, guests: 50 },
];

const timeSlots = [
  '10:00 AM - 1:00 PM',
  '2:00 PM - 5:00 PM',
  '6:00 PM - 9:00 PM',
];

export default function AdminEvents() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    parent_name: '',
    parent_phone: '',
    slot_date: new Date(),
    time_slot: timeSlots[0],
    booking_type: 'birthday_event' as 'birthday_event' | 'private_event',
    package: 'standard',
    notes: ''
  });
  
  // Detail dialog
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
      console.error('[Events] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async () => {
    if (!formData.parent_name.trim() || !formData.parent_phone.trim()) {
      toast.error(language === 'bn' ? 'নাম এবং ফোন আবশ্যক' : 'Name and phone required');
      return;
    }

    setCreating(true);
    try {
      const bookingData = {
        parent_name: formData.parent_name.trim(),
        parent_phone: formData.parent_phone.trim(),
        slot_date: format(formData.slot_date, 'yyyy-MM-dd'),
        time_slot: formData.time_slot,
        booking_type: formData.booking_type,
        ticket_type: 'group' as const,
        status: 'pending' as const,
        payment_status: 'unpaid',
        notes: formData.notes.trim() ? `Package: ${formData.package}\n${formData.notes}` : `Package: ${formData.package}`
      };

      const { error: insertError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (insertError) throw insertError;

      toast.success(language === 'bn' ? 'ইভেন্ট বুকিং তৈরি হয়েছে' : 'Event booking created');
      setCreateOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      console.error('[Events] Create error:', err);
      toast.error(language === 'bn' ? 'তৈরি ব্যর্থ' : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parent_name: '',
      parent_phone: '',
      slot_date: new Date(),
      time_slot: timeSlots[0],
      booking_type: 'birthday_event',
      package: 'standard',
      notes: ''
    });
  };

  const handleStatusChange = async (eventId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', eventId);

      if (updateError) throw updateError;
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch (err) {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const handlePaymentChange = async (eventId: string, paymentStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', eventId);

      if (updateError) throw updateError;
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, payment_status: paymentStatus } : e));
      toast.success(language === 'bn' ? 'পেমেন্ট আপডেট হয়েছে' : 'Payment updated');
    } catch (err) {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const openDetailDialog = (event: EventBooking) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!event.parent_name.toLowerCase().includes(query) &&
          !event.parent_phone.includes(query)) {
        return false;
      }
    }
    if (typeFilter !== 'all' && event.booking_type !== typeFilter) return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
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
      case 'partial':
        return <Badge variant="outline" className="text-blue-600"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'আংশিক' : 'Partial'}</Badge>;
      default:
        return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" /> {language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'birthday_event') {
      return <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20"><Cake className="w-3 h-3 mr-1" /> {language === 'bn' ? 'জন্মদিন' : 'Birthday'}</Badge>;
    }
    return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20"><Gift className="w-3 h-3 mr-1" /> {language === 'bn' ? 'প্রাইভেট' : 'Private'}</Badge>;
  };

  // Stats
  const birthdayCount = events.filter(e => e.booking_type === 'birthday_event').length;
  const privateCount = events.filter(e => e.booking_type === 'private_event').length;
  const confirmedCount = events.filter(e => e.status === 'confirmed').length;
  const pendingCount = events.filter(e => e.status === 'pending').length;

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PartyPopper className="w-6 h-6" />
            {language === 'bn' ? 'ইভেন্ট ম্যানেজমেন্ট' : 'Events'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'বার্থডে পার্টি ও প্রাইভেট ইভেন্ট' : 'Birthday parties & private events'}
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'নতুন ইভেন্ট' : 'New Event'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'জন্মদিন পার্টি' : 'Birthday Parties'}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" />
              {birthdayCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'প্রাইভেট ইভেন্ট' : 'Private Events'}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              {privateCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{confirmedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Event Packages Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{language === 'bn' ? 'প্যাকেজ সমূহ' : 'Event Packages'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventPackages.map(pkg => (
              <div key={pkg.id} className="p-3 border rounded-lg text-center">
                <p className="font-semibold">{language === 'bn' ? pkg.nameBn : pkg.name}</p>
                <p className="text-lg font-bold text-primary">৳{pkg.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> {pkg.guests} {language === 'bn' ? 'জন' : 'guests'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{language === 'bn' ? 'ইভেন্ট তালিকা' : 'Event List'}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
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
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব টাইপ' : 'All Types'}</SelectItem>
                <SelectItem value="birthday_event">{language === 'bn' ? 'জন্মদিন' : 'Birthday'}</SelectItem>
                <SelectItem value="private_event">{language === 'bn' ? 'প্রাইভেট' : 'Private'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব স্ট্যাটাস' : 'All Status'}</SelectItem>
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
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchEvents} className="mt-4" size="sm">
                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
              </Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{language === 'bn' ? 'গ্রাহক' : 'Customer'}</TableHead>
                  <TableHead>{language === 'bn' ? 'টাইপ' : 'Type'}</TableHead>
                  <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {[1,2,3,4].map(i => <TableRowSkeleton key={i} />)}
              </tbody>
            </Table>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'bn' ? 'কোনো ইভেন্ট নেই' : 'No events found'}</p>
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
                    <TableHead>{language === 'bn' ? 'গ্রাহক' : 'Customer'}</TableHead>
                    <TableHead>{language === 'bn' ? 'টাইপ' : 'Type'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(parseISO(event.slot_date), 'dd MMM yyyy', { 
                            locale: language === 'bn' ? bn : undefined 
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">{event.time_slot}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.parent_name}</div>
                        <a href={`tel:${event.parent_phone}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {event.parent_phone}
                        </a>
                      </TableCell>
                      <TableCell>{getTypeBadge(event.booking_type)}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>{getPaymentBadge(event.payment_status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailDialog(event)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {language === 'bn' ? 'বিস্তারিত' : 'View'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(event.id, 'confirmed')}
                              disabled={event.status === 'confirmed' || event.status === 'cancelled'}
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePaymentChange(event.id, 'paid')}
                              disabled={event.payment_status === 'paid'}
                            >
                              <Banknote className="w-4 h-4 mr-2 text-green-600" />
                              {language === 'bn' ? 'পেমেন্ট সম্পন্ন' : 'Mark Paid'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(event.id, 'cancelled')}
                              disabled={event.status === 'cancelled'}
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

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5" />
              {language === 'bn' ? 'নতুন ইভেন্ট বুকিং' : 'New Event Booking'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'বার্থডে বা প্রাইভেট ইভেন্ট বুক করুন' : 'Book a birthday or private event'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ইভেন্ট টাইপ' : 'Event Type'}</Label>
              <Select value={formData.booking_type} onValueChange={(v: 'birthday_event' | 'private_event') => setFormData({...formData, booking_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday_event">
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4" /> {language === 'bn' ? 'জন্মদিন পার্টি' : 'Birthday Party'}
                    </div>
                  </SelectItem>
                  <SelectItem value="private_event">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" /> {language === 'bn' ? 'প্রাইভেট ইভেন্ট' : 'Private Event'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'প্যাকেজ' : 'Package'}</Label>
              <Select value={formData.package} onValueChange={(v) => setFormData({...formData, package: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventPackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {language === 'bn' ? pkg.nameBn : pkg.name} - ৳{pkg.price.toLocaleString()} ({pkg.guests} {language === 'bn' ? 'জন' : 'guests'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {format(formData.slot_date, 'dd MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.slot_date}
                      onSelect={(date) => date && setFormData({...formData, slot_date: date})}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'সময়' : 'Time Slot'}</Label>
                <Select value={formData.time_slot} onValueChange={(v) => setFormData({...formData, time_slot: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'} *</Label>
              <Input
                value={formData.parent_name}
                onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ফোন নম্বর' : 'Phone'} *</Label>
              <Input
                value={formData.parent_phone}
                onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                placeholder={language === 'bn' ? 'বিশেষ অনুরোধ, থিম ইত্যাদি...' : 'Special requests, theme, etc...'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateEvent} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'বুক করুন' : 'Book Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.booking_type === 'birthday_event' ? (
                <Cake className="w-5 h-5 text-pink-500" />
              ) : (
                <Gift className="w-5 h-5 text-purple-500" />
              )}
              {language === 'bn' ? 'ইভেন্ট বিস্তারিত' : 'Event Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(parseISO(selectedEvent.slot_date), 'EEEE, dd MMMM yyyy', { locale: language === 'bn' ? bn : undefined })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {getTypeBadge(selectedEvent.booking_type)}
                {getStatusBadge(selectedEvent.status)}
                {getPaymentBadge(selectedEvent.payment_status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'গ্রাহক' : 'Customer'}</Label>
                  <p className="font-medium">{selectedEvent.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                  <p className="font-medium">{selectedEvent.parent_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'সময়' : 'Time'}</Label>
                  <p className="font-medium">{selectedEvent.time_slot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বুক করা হয়েছে' : 'Booked On'}</Label>
                  <p className="font-medium text-sm">
                    {format(parseISO(selectedEvent.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              
              {selectedEvent.notes && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap bg-muted p-2 rounded">{selectedEvent.notes}</p>
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
    </div>
  );
}
