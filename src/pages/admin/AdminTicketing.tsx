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
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
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
  Filter,
  X,
  Printer,
  MessageSquare,
  DoorOpen,
  DoorClosed
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { PrintableTicket } from '@/components/admin/PrintableTicket';
import { QRScannerDialog } from '@/components/admin/QRScannerDialog';
import { CounterTicketForm } from '@/components/admin/ticketing/CounterTicketForm';
import { TicketSuccessDialog } from '@/components/admin/ticketing/TicketSuccessDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

export default function AdminTicketing() {
  const { language } = useLanguage();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Print dialog
  const [printOpen, setPrintOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [sendingSMS, setSendingSMS] = useState<string | null>(null);
  const [gateActionLoading, setGateActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    ticket_type: 'hourly_play',
    slot_date: new Date(),
    time_slot: '',
    child_name: '',
    guardian_name: '',
    guardian_phone: '',
    notes: ''
  });

  const handleTicketCreated = (ticket: any) => {
    setCreatedTicket(ticket);
    setShowSuccessDialog(true);
    fetchTickets();
    setActiveTab('list');
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTickets((data || []) as TicketType[]);
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

  const generateTicketNumber = () => {
    const prefix = 'BW';
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${date}${random}`;
  };

  const handleCreateTicket = async () => {
    if (!newTicket.guardian_name || !newTicket.guardian_phone) {
      toast.error(language === 'bn' ? 'অভিভাবকের তথ্য দিন' : 'Guardian info required');
      return;
    }

    setCreating(true);
    try {
      const ticketData = {
        ticket_number: generateTicketNumber(),
        ticket_type: newTicket.ticket_type,
        source: 'physical' as const,
        status: 'active' as const,
        slot_date: format(newTicket.slot_date, 'yyyy-MM-dd'),
        time_slot: newTicket.time_slot || null,
        child_name: newTicket.child_name || null,
        guardian_name: newTicket.guardian_name,
        guardian_phone: newTicket.guardian_phone,
        notes: newTicket.notes || null
      };

      const { error: insertError } = await supabase
        .from('tickets')
        .insert([ticketData]);

      if (insertError) throw insertError;

      toast.success(language === 'bn' ? 'টিকেট তৈরি হয়েছে' : 'Ticket created');
      setCreateOpen(false);
      setNewTicket({
        ticket_type: 'hourly_play',
        slot_date: new Date(),
        time_slot: '',
        child_name: '',
        guardian_name: '',
        guardian_phone: '',
        notes: ''
      });
      fetchTickets();
    } catch (err: any) {
      console.error('[Ticketing] Create error:', err);
      toast.error(language === 'bn' ? 'টিকেট তৈরি ব্যর্থ' : 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkUsed = async (ticketId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      toast.success(language === 'bn' ? 'টিকেট ব্যবহৃত হয়েছে' : 'Ticket marked as used');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'used' as const, used_at: new Date().toISOString() } : t
      ));
    } catch (err) {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      toast.success(language === 'bn' ? 'টিকেট বাতিল হয়েছে' : 'Ticket cancelled');
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'cancelled' as const } : t
      ));
    } catch (err) {
      toast.error(language === 'bn' ? 'বাতিল ব্যর্থ' : 'Cancel failed');
    }
  };

  // Print ticket
  const handlePrintTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setPrintOpen(true);
  };

  // Send SMS confirmation
  const handleSendSMS = async (ticket: TicketType) => {
    setSendingSMS(ticket.id);
    try {
      const message = language === 'bn'
        ? `Baby World টিকেট: ${ticket.ticket_number}\nতারিখ: ${ticket.slot_date}\nসময়: ${ticket.time_slot || 'যেকোনো'}\nধন্যবাদ!`
        : `Baby World Ticket: ${ticket.ticket_number}\nDate: ${ticket.slot_date}\nTime: ${ticket.time_slot || 'Any'}\nThank you!`;

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phone: ticket.guardian_phone, message }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(language === 'bn' ? 'SMS পাঠানো হয়েছে' : 'SMS sent successfully');
      } else {
        toast.warning(language === 'bn' ? 'SMS পাঠানো যায়নি (credentials সেট করা নেই)' : 'SMS could not be sent (credentials not configured)');
      }
    } catch (err) {
      console.error('SMS error:', err);
      toast.error(language === 'bn' ? 'SMS পাঠাতে সমস্যা হয়েছে' : 'Failed to send SMS');
    } finally {
      setSendingSMS(null);
    }
  };

  // Gate Entry/Exit handlers
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

      toast.success(language === 'bn' ? 'এন্ট্রি রেকর্ড হয়েছে' : 'Entry logged successfully');
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, inside_venue: true, status: 'used' as const, used_at: new Date().toISOString() } : t
      ));
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || (language === 'bn' ? 'এন্ট্রি ব্যর্থ' : 'Entry failed'));
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

      toast.success(language === 'bn' ? 'এক্সিট রেকর্ড হয়েছে' : 'Exit logged successfully');
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, inside_venue: false } : t
      ));
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || (language === 'bn' ? 'এক্সিট ব্যর্থ' : 'Exit failed'));
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
    if (dateFilter) {
      if (ticket.slot_date !== format(dateFilter, 'yyyy-MM-dd')) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'সক্রিয়' : 'Active'}</Badge>;
      case 'used':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {language === 'bn' ? 'ব্যবহৃত' : 'Used'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {language === 'bn' ? 'বাতিল' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeCount = tickets.filter(t => t.status === 'active').length;
  const usedCount = tickets.filter(t => t.status === 'used').length;
  const todayCount = tickets.filter(t => t.slot_date === format(new Date(), 'yyyy-MM-dd')).length;
  const insideCount = tickets.filter(t => t.inside_venue).length;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter(undefined);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter;

  const timeSlots = [
    '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            {language === 'bn' ? 'টিকেটিং' : 'Ticketing'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'টিকেট ম্যানেজমেন্ট' : 'Manage tickets'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <QRScannerDialog />
        </div>
      </div>

      {/* Tabs for List and Create */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">
            {language === 'bn' ? 'টিকেট তালিকা' : 'Ticket List'}
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'bn' ? 'নতুন টিকেট' : 'Create Ticket'}
          </TabsTrigger>
        </TabsList>

        {/* Create Tab - Counter Ticket Form */}
        <TabsContent value="create" className="mt-6">
          <CounterTicketForm onSuccess={handleTicketCreated} />
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="mt-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'সক্রিয় টিকেট' : 'Active Tickets'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের টিকেট' : "Today's Tickets"}</CardDescription>
            <CardTitle className="text-2xl">{todayCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'ব্যবহৃত' : 'Used'}</CardDescription>
            <CardTitle className="text-2xl text-muted-foreground">{usedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{language === 'bn' ? 'টিকেট তালিকা' : 'Ticket List'}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'টিকেট নং, নাম বা ফোন...' : 'Ticket #, name or phone...'}
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
                <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                <SelectItem value="active">{language === 'bn' ? 'সক্রিয়' : 'Active'}</SelectItem>
                <SelectItem value="used">{language === 'bn' ? 'ব্যবহৃত' : 'Used'}</SelectItem>
                <SelectItem value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</SelectItem>
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
              <Button onClick={fetchTickets} className="mt-4" size="sm">
                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
              </Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'টিকেট নং' : 'Ticket #'}</TableHead>
                  <TableHead>{language === 'bn' ? 'অভিভাবক' : 'Guardian'}</TableHead>
                  <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} />)}
              </tbody>
            </Table>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'bn' ? 'কোনো টিকেট নেই' : 'No tickets found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'টিকেট নং' : 'Ticket #'}</TableHead>
                    <TableHead>{language === 'bn' ? 'অভিভাবক' : 'Guardian'}</TableHead>
                    <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{language === 'bn' ? 'সময়' : 'Time'}</TableHead>
                    <TableHead>{language === 'bn' ? 'উৎস' : 'Source'}</TableHead>
                    <TableHead>{language === 'bn' ? 'অবস্থান' : 'Location'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.guardian_name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.guardian_phone}</div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(ticket.slot_date), 'dd MMM yyyy', { 
                          locale: language === 'bn' ? bn : undefined 
                        })}
                      </TableCell>
                      <TableCell className="text-sm">{ticket.time_slot || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{ticket.source}</Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.inside_venue ? (
                          <Badge className="bg-primary/10 text-primary">
                            <DoorOpen className="w-3 h-3 mr-1" />
                            {language === 'bn' ? 'ভিতরে' : 'Inside'}
                          </Badge>
                        ) : ticket.status === 'used' ? (
                          <Badge variant="secondary">
                            <DoorClosed className="w-3 h-3 mr-1" />
                            {language === 'bn' ? 'বাইরে' : 'Exited'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {/* Gate Entry/Exit buttons */}
                          {ticket.status !== 'cancelled' && (
                            <>
                              {!ticket.inside_venue && ticket.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleGateEntry(ticket)}
                                  disabled={gateActionLoading === ticket.id}
                                  title={language === 'bn' ? 'এন্ট্রি' : 'Gate Entry'}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {gateActionLoading === ticket.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <DoorOpen className="w-3 h-3 mr-1" />
                                      {language === 'bn' ? 'এন্ট্রি' : 'Entry'}
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
                                  title={language === 'bn' ? 'এক্সিট' : 'Gate Exit'}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  {gateActionLoading === ticket.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <DoorClosed className="w-3 h-3 mr-1" />
                                      {language === 'bn' ? 'এক্সিট' : 'Exit'}
                                    </>
                                  )}
                                </Button>
                              )}
                            </>
                          )}

                          {/* Print button */}
                          <Button size="sm" variant="ghost" onClick={() => handlePrintTicket(ticket)} title={language === 'bn' ? 'প্রিন্ট' : 'Print'}>
                            <Printer className="w-3 h-3" />
                          </Button>
                          
                          {/* SMS button */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleSendSMS(ticket)}
                            disabled={sendingSMS === ticket.id}
                            title={language === 'bn' ? 'SMS পাঠান' : 'Send SMS'}
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
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Print Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              {language === 'bn' ? 'টিকেট প্রিন্ট' : 'Print Ticket'}
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
                createdAt: selectedTicket.created_at
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
      />
    </div>
  );
}
