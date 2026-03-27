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
  
  Gift,
  Banknote
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

interface EventPackage {
  id: string;
  name: string;
  price: number;
  max_guests: number;
  duration_hours: number;
  is_active: boolean;
  image_url: string | null;
}

const timeSlots = [
  '10:00 AM - 1:00 PM',
  '2:00 PM - 5:00 PM',
  '6:00 PM - 9:00 PM',
];

export default function AdminEvents() {
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  
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
    package: '',
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

  const fetchPackages = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('event_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      const pkgs = (data || []) as EventPackage[];
      setEventPackages(pkgs);
      if (pkgs.length > 0 && !formData.package) {
        setFormData(prev => ({ ...prev, package: pkgs[0].id }));
      }
    } catch (err) {
      console.error('[Events] Packages error:', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchPackages();
  }, [fetchEvents, fetchPackages]);

  const handleCreateEvent = async () => {
    if (!formData.parent_name.trim() || !formData.parent_phone.trim()) {
      toast.error('Name and phone required');
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
        notes: (() => {
          const selectedPkg = eventPackages.find(p => p.id === formData.package);
          const pkgInfo = selectedPkg ? `Package: ${selectedPkg.name} (৳${selectedPkg.price.toLocaleString()})` : '';
          return formData.notes.trim() ? `${pkgInfo}\n${formData.notes}` : pkgInfo;
        })()
      };

      const { error: insertError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (insertError) throw insertError;

      toast.success('Event booking created');
      setCreateOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      console.error('[Events] Create error:', err);
      toast.error('Create failed');
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
      package: eventPackages.length > 0 ? eventPackages[0].id : '',
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
      toast.success('Status updated');
    } catch (err) {
      toast.error('Update failed');
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
      toast.success('Payment updated');
    } catch (err) {
      toast.error('Update failed');
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
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> {'Confirmed'}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> {'Pending'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {'Cancelled'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CreditCard className="w-3 h-3 mr-1" /> {'Paid'}</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-blue-600"><CreditCard className="w-3 h-3 mr-1" /> {'Partial'}</Badge>;
      default:
        return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" /> {'Unpaid'}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'birthday_event') {
      return <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20"><Cake className="w-3 h-3 mr-1" /> {'Birthday'}</Badge>;
    }
    return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20"><Gift className="w-3 h-3 mr-1" /> {'Private'}</Badge>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PartyPopper className="w-6 h-6" />
            {'Bookings'}
          </h1>
          <p className="text-muted-foreground">
            {'Manage birthday parties & private event bookings'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
          {/* New Event Button */}
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {'New Event'}
            </Button>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{'Birthday Parties'}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" />
              {birthdayCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardDescription>{'Private Events'}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              {privateCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Confirmed'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{confirmedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Pending'}</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>


      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{'Booking List'}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {'Refresh'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={'Name or phone...'}
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
                <SelectItem value="all">{'All Types'}</SelectItem>
                <SelectItem value="birthday_event">{'Birthday'}</SelectItem>
                <SelectItem value="private_event">{'Private'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Status'}</SelectItem>
                <SelectItem value="confirmed">{'Confirmed'}</SelectItem>
                <SelectItem value="pending">{'Pending'}</SelectItem>
                <SelectItem value="cancelled">{'Cancelled'}</SelectItem>
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
                {'Try Again'}
              </Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{'Date'}</TableHead>
                  <TableHead>{'Customer'}</TableHead>
                  <TableHead>{'Type'}</TableHead>
                  <TableHead>{'Status'}</TableHead>
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
              <p>{'No bookings found'}</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  {'Clear filters'}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{'Date & Time'}</TableHead>
                    <TableHead>{'Customer'}</TableHead>
                    <TableHead>{'Type'}</TableHead>
                    <TableHead>{'Status'}</TableHead>
                    <TableHead>{'Payment'}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(parseISO(event.slot_date), 'dd MMM yyyy', { 
                            locale: undefined 
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
                              {'View'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(event.id, 'confirmed')}
                              disabled={event.status === 'confirmed' || event.status === 'cancelled'}
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              {'Confirm'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePaymentChange(event.id, 'paid')}
                              disabled={event.payment_status === 'paid'}
                            >
                              <Banknote className="w-4 h-4 mr-2 text-green-600" />
                              {'Mark Paid'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(event.id, 'cancelled')}
                              disabled={event.status === 'cancelled'}
                              className="text-destructive"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              {'Cancel'}
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
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5" />
              {'New Event Booking'}
            </DialogTitle>
            <DialogDescription>
              {'Book a birthday or private event'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{'Event Type'}</Label>
              <Select value={formData.booking_type} onValueChange={(v: 'birthday_event' | 'private_event') => setFormData({...formData, booking_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday_event">
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4" /> {'Birthday Party'}
                    </div>
                  </SelectItem>
                  <SelectItem value="private_event">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" /> {'Private Event'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{'Package'}</Label>
              <Select value={formData.package} onValueChange={(v) => setFormData({...formData, package: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventPackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - ৳{pkg.price.toLocaleString()} ({pkg.max_guests} {'guests'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{'Date'}</Label>
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
                <Label>{'Time Slot'}</Label>
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
              <Label>{'Customer Name'} *</Label>
              <Input
                value={formData.parent_name}
                onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>{'Phone'} *</Label>
              <Input
                value={formData.parent_phone}
                onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>{'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                placeholder={'Special requests, theme, etc...'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {'Cancel'}
            </Button>
            <Button onClick={handleCreateEvent} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {'Book Event'}
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
              {'Event Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(parseISO(selectedEvent.slot_date), 'EEEE, dd MMMM yyyy', { locale: undefined })}
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
                  <Label className="text-muted-foreground">{'Customer'}</Label>
                  <p className="font-medium">{selectedEvent.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Phone'}</Label>
                  <p className="font-medium">{selectedEvent.parent_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Time'}</Label>
                  <p className="font-medium">{selectedEvent.time_slot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Booked On'}</Label>
                  <p className="font-medium text-sm">
                    {format(parseISO(selectedEvent.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              
              {selectedEvent.notes && (
                <div>
                  <Label className="text-muted-foreground">{'Notes'}</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap bg-muted p-2 rounded">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
