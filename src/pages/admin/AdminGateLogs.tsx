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
  DoorOpen, 
  DoorClosed, 
  Search, 
  RefreshCw,
  CalendarDays,
  Camera,
  Clock,
  User,
  Ticket,
  Copy,
  Check,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface GateLog {
  id: string;
  ticket_id: string;
  entry_type: 'entry' | 'exit';
  gate_id: string;
  camera_ref: string | null;
  scanned_by: string | null;
  scanned_by_name: string | null;
  created_at: string;
  tickets: {
    ticket_number: string;
    child_name: string | null;
    guardian_name: string;
    guardian_phone: string;
  } | null;
}

interface GateCamera {
  id: string;
  gate_id: string;
  gate_name: string;
  camera_ref: string | null;
  is_active: boolean;
}

export default function AdminGateLogs() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<GateLog[]>([]);
  const [gates, setGates] = useState<GateCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  // Filters
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [gateFilter, setGateFilter] = useState<string>('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<GateLog | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {
        page,
        limit,
      };

      if (dateFrom) filters.date_from = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) filters.date_to = format(dateTo, 'yyyy-MM-dd');
      if (gateFilter !== 'all') filters.gate_id = gateFilter;
      if (entryTypeFilter !== 'all') filters.entry_type = entryTypeFilter;

      const { data, error } = await supabase.functions.invoke('gate-scan', {
        body: {
          action: 'get_logs',
          filters
        }
      });

      if (error) throw error;

      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setGates(data.gates || []);
    } catch (err: unknown) {
      console.error('[GateLogs] Error:', err);
      toast.error(language === 'bn' ? 'লোড করতে সমস্যা হয়েছে' : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, gateFilter, entryTypeFilter, language]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs by search query (client-side)
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.tickets?.ticket_number.toLowerCase().includes(query) ||
      log.tickets?.guardian_name.toLowerCase().includes(query) ||
      log.tickets?.guardian_phone.includes(query)
    );
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(language === 'bn' ? 'কপি হয়েছে' : 'Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setGateFilter('all');
    setEntryTypeFilter('all');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters = dateFrom || dateTo || gateFilter !== 'all' || entryTypeFilter !== 'all' || searchQuery;

  const totalPages = Math.ceil(total / limit);

  // Stats
  const todayLogs = logs.filter(l => 
    format(parseISO(l.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const entryCount = todayLogs.filter(l => l.entry_type === 'entry').length;
  const exitCount = todayLogs.filter(l => l.entry_type === 'exit').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            {language === 'bn' ? 'গেট লগ' : 'Gate Logs'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'এন্ট্রি/এক্সিট ট্র্যাকিং ও CCTV রেফারেন্স' : 'Entry/Exit tracking with CCTV reference'}
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের এন্ট্রি' : "Today's Entries"}</CardDescription>
            <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              {entryCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'আজকের এক্সিট' : "Today's Exits"}</CardDescription>
            <CardTitle className="text-2xl text-orange-600 flex items-center gap-2">
              <DoorClosed className="w-5 h-5" />
              {exitCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'bn' ? 'বর্তমানে ভিতরে' : 'Currently Inside'}</CardDescription>
            <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
              <User className="w-5 h-5" />
              {entryCount - exitCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{language === 'bn' ? 'লগ তালিকা' : 'Log History'}</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear Filters'}
              </Button>
            )}
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'dd MMM') : (language === 'bn' ? 'থেকে' : 'From')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setPage(1); }} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {dateTo ? format(dateTo, 'dd MMM') : (language === 'bn' ? 'পর্যন্ত' : 'To')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setPage(1); }} />
              </PopoverContent>
            </Popover>

            <Select value={gateFilter} onValueChange={(v) => { setGateFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder={language === 'bn' ? 'গেট' : 'Gate'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব গেট' : 'All Gates'}</SelectItem>
                {gates.map(g => (
                  <SelectItem key={g.gate_id} value={g.gate_id}>{g.gate_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entryTypeFilter} onValueChange={(v) => { setEntryTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                <SelectItem value="entry">{language === 'bn' ? 'এন্ট্রি' : 'Entry'}</SelectItem>
                <SelectItem value="exit">{language === 'bn' ? 'এক্সিট' : 'Exit'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'bn' ? 'কোনো লগ পাওয়া যায়নি' : 'No logs found'}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'bn' ? 'সময়' : 'Time'}</TableHead>
                      <TableHead>{language === 'bn' ? 'টাইপ' : 'Type'}</TableHead>
                      <TableHead>{language === 'bn' ? 'টিকেট' : 'Ticket'}</TableHead>
                      <TableHead className="hidden md:table-cell">{language === 'bn' ? 'অতিথি' : 'Guest'}</TableHead>
                      <TableHead className="hidden lg:table-cell">{language === 'bn' ? 'গেট' : 'Gate'}</TableHead>
                      <TableHead className="hidden lg:table-cell">{language === 'bn' ? 'ক্যামেরা' : 'Camera'}</TableHead>
                      <TableHead className="hidden md:table-cell">{language === 'bn' ? 'স্ক্যানকারী' : 'Scanned By'}</TableHead>
                      <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                        <TableCell className="font-mono text-sm">
                          {format(parseISO(log.created_at), 'dd MMM HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          {log.entry_type === 'entry' ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              <DoorOpen className="w-3 h-3 mr-1" />
                              {language === 'bn' ? 'এন্ট্রি' : 'Entry'}
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-600">
                              <DoorClosed className="w-3 h-3 mr-1" />
                              {language === 'bn' ? 'এক্সিট' : 'Exit'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {log.tickets?.ticket_number || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {log.tickets?.guardian_name || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {gates.find(g => g.gate_id === log.gate_id)?.gate_name || log.gate_id}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-mono text-sm">
                          {log.camera_ref || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {log.scanned_by_name || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' 
                      ? `মোট ${total} টি লগের মধ্যে ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} দেখাচ্ছে`
                      : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} logs`}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog?.entry_type === 'entry' ? (
                <DoorOpen className="w-5 h-5 text-green-600" />
              ) : (
                <DoorClosed className="w-5 h-5 text-orange-600" />
              )}
              {language === 'bn' ? 'লগ বিস্তারিত' : 'Log Details'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'CCTV ফুটেজ খুঁজতে নীচের তথ্য ব্যবহার করুন' : 'Use the info below to find CCTV footage'}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* CCTV Reference - Highlighted */}
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {language === 'bn' ? 'CCTV রেফারেন্স' : 'CCTV Reference'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'bn' ? 'ক্যামেরা' : 'Camera'}</p>
                      <p className="font-mono text-lg font-bold">{selectedLog.camera_ref || 'N/A'}</p>
                    </div>
                    {selectedLog.camera_ref && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedLog.camera_ref!, 'camera')}
                      >
                        {copiedField === 'camera' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'bn' ? 'টাইমস্ট্যাম্প' : 'Timestamp'}</p>
                      <p className="font-mono font-bold">{format(parseISO(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(format(parseISO(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss'), 'timestamp')}
                    >
                      {copiedField === 'timestamp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Other Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'টাইপ' : 'Type'}</Label>
                  <p className="font-medium">
                    {selectedLog.entry_type === 'entry' 
                      ? (language === 'bn' ? 'এন্ট্রি' : 'Entry')
                      : (language === 'bn' ? 'এক্সিট' : 'Exit')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'গেট' : 'Gate'}</Label>
                  <p className="font-medium">
                    {gates.find(g => g.gate_id === selectedLog.gate_id)?.gate_name || selectedLog.gate_id}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'টিকেট নম্বর' : 'Ticket Number'}</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{selectedLog.tickets?.ticket_number}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(selectedLog.tickets?.ticket_number || '', 'ticket')}
                  >
                    {copiedField === 'ticket' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'অতিথি' : 'Guest'}</Label>
                <p className="font-medium">{selectedLog.tickets?.guardian_name}</p>
                <p className="text-sm text-muted-foreground">{selectedLog.tickets?.guardian_phone}</p>
              </div>

              {selectedLog.scanned_by_name && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'স্ক্যান করেছেন' : 'Scanned By'}</Label>
                  <p className="font-medium">{selectedLog.scanned_by_name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
