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
  User,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
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
  const [logs, setLogs] = useState<GateLog[]>([]);
  const [gates, setGates] = useState<GateCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [gateFilter, setGateFilter] = useState<string>('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLog, setSelectedLog] = useState<GateLog | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = { page, limit };
      if (dateFrom) filters.date_from = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) filters.date_to = format(dateTo, 'yyyy-MM-dd');
      if (gateFilter !== 'all') filters.gate_id = gateFilter;
      if (entryTypeFilter !== 'all') filters.entry_type = entryTypeFilter;

      const { data, error } = await supabase.functions.invoke('gate-scan', {
        body: { action: 'get_logs', filters }
      });
      if (error) throw error;
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setGates(data.gates || []);
    } catch (err: unknown) {
      console.error('[GateLogs] Error:', err);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, gateFilter, entryTypeFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

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
    toast.success('Copied to clipboard');
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

  const todayLogs = logs.filter(l =>
    format(parseISO(l.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const entryCount = todayLogs.filter(l => l.entry_type === 'entry').length;
  const exitCount = todayLogs.filter(l => l.entry_type === 'exit').length;

  const getGateName = (gateId: string) =>
    gates.find(g => g.gate_id === gateId)?.gate_name || gateId;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="h-9 px-2 lg:px-3">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline ml-2">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards — always 3 cols */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        <Card>
          <CardHeader className="p-2 pb-1 lg:p-4 lg:pb-2">
            <CardDescription className="text-[10px] lg:text-xs">{"Today's Entries"}</CardDescription>
            <CardTitle className="text-lg lg:text-2xl text-green-600 flex items-center gap-1 lg:gap-2">
              <DoorOpen className="w-4 h-4 lg:w-5 lg:h-5" />
              {entryCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-2 pb-1 lg:p-4 lg:pb-2">
            <CardDescription className="text-[10px] lg:text-xs">{"Today's Exits"}</CardDescription>
            <CardTitle className="text-lg lg:text-2xl text-orange-600 flex items-center gap-1 lg:gap-2">
              <DoorClosed className="w-4 h-4 lg:w-5 lg:h-5" />
              {exitCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-2 pb-1 lg:p-4 lg:pb-2">
            <CardDescription className="text-[10px] lg:text-xs">{'Currently Inside'}</CardDescription>
            <CardTitle className="text-lg lg:text-2xl text-blue-600 flex items-center gap-1 lg:gap-2">
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              {entryCount - exitCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader className="p-3 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base lg:text-lg">{'Log History'}</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Filters — wrapped row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarDays className="w-3.5 h-3.5 mr-1" />
                  {dateFrom ? format(dateFrom, 'dd MMM') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setPage(1); }} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarDays className="w-3.5 h-3.5 mr-1" />
                  {dateTo ? format(dateTo, 'dd MMM') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setPage(1); }} />
              </PopoverContent>
            </Popover>

            <Select value={gateFilter} onValueChange={(v) => { setGateFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[100px] lg:w-[140px] h-8 text-xs">
                <SelectValue placeholder="Gate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gates</SelectItem>
                {gates.map(g => (
                  <SelectItem key={g.gate_id} value={g.gate_id}>{g.gate_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entryTypeFilter} onValueChange={(v) => { setEntryTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[90px] lg:w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No logs found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-2.5 active:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={log.entry_type === 'entry'
                          ? 'bg-green-500/10 text-green-600 border-green-500/20 text-[11px] px-1.5 py-0'
                          : 'bg-orange-500/10 text-orange-600 border-orange-500/20 text-[11px] px-1.5 py-0'
                        }
                      >
                        {log.entry_type === 'entry' ? (
                          <DoorOpen className="w-3 h-3 mr-0.5" />
                        ) : (
                          <DoorClosed className="w-3 h-3 mr-0.5" />
                        )}
                        {log.entry_type === 'entry' ? 'Entry' : 'Exit'}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {format(parseISO(log.created_at), 'dd MMM HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <span className="font-mono font-medium">{log.tickets?.ticket_number || '-'}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="truncate">{log.tickets?.guardian_name || '-'}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{getGateName(log.gate_id)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Gate</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead>Scanned By</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                              <DoorOpen className="w-3 h-3 mr-1" />Entry
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-600">
                              <DoorClosed className="w-3 h-3 mr-1" />Exit
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{log.tickets?.ticket_number || '-'}</TableCell>
                        <TableCell>{log.tickets?.guardian_name || '-'}</TableCell>
                        <TableCell>{getGateName(log.gate_id)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.camera_ref || '-'}</TableCell>
                        <TableCell>{log.scanned_by_name || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    {`${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
                  </p>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
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
              Log Details
            </DialogTitle>
            <DialogDescription>Use the info below to find CCTV footage</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />CCTV Reference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Camera</p>
                      <p className="font-mono text-lg font-bold">{selectedLog.camera_ref || 'N/A'}</p>
                    </div>
                    {selectedLog.camera_ref && (
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedLog.camera_ref!, 'camera')}>
                        {copiedField === 'camera' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="font-mono font-bold">{format(parseISO(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(format(parseISO(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss'), 'timestamp')}>
                      {copiedField === 'timestamp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedLog.entry_type === 'entry' ? 'Entry' : 'Exit'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gate</Label>
                  <p className="font-medium">{getGateName(selectedLog.gate_id)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Ticket Number</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{selectedLog.tickets?.ticket_number}</p>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedLog.tickets?.ticket_number || '', 'ticket')}>
                    {copiedField === 'ticket' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Guest</Label>
                <p className="font-medium">{selectedLog.tickets?.guardian_name}</p>
                <p className="text-sm text-muted-foreground">{selectedLog.tickets?.guardian_phone}</p>
              </div>

              {selectedLog.scanned_by_name && (
                <div>
                  <Label className="text-muted-foreground">Scanned By</Label>
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
