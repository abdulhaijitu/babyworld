import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, 
  Phone, 
  RefreshCw, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface NotificationLog {
  id: string;
  channel: string;
  recipient_phone: string;
  message: string;
  status: string;
  reference_type: string | null;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
}

export default function AdminNotificationLogs() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (channelFilter !== 'all') {
        query = query.eq('channel', channelFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch notification logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [channelFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {'Sent'}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            {'Failed'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {'Pending'}
          </Badge>
        );
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'whatsapp' 
      ? <MessageSquare className="w-4 h-4 text-green-500" />
      : <Phone className="w-4 h-4 text-blue-500" />;
  };

  const getReferenceTypeBadge = (type: string | null) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      ticket: 'Ticket',
      food_order: 'Food Order',
      booking: 'Booking'
    };
    return <Badge variant="secondary">{labels[type] || type}</Badge>;
  };

  const filteredLogs = logs.filter(log =>
    log.recipient_phone.includes(searchTerm) ||
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalSent = logs.filter(l => l.status === 'sent').length;
  const totalFailed = logs.filter(l => l.status === 'failed').length;
  const smsCount = logs.filter(l => l.channel === 'sms').length;
  const waCount = logs.filter(l => l.channel === 'whatsapp').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {'Notification Logs'}
          </h1>
          <p className="text-muted-foreground">
            {'SMS and WhatsApp notification history'}
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{totalSent}</div>
            <div className="text-sm text-muted-foreground">
              {'Sent'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-muted-foreground">
              {'Failed'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{smsCount}</div>
            <div className="text-sm text-muted-foreground">SMS</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{waCount}</div>
            <div className="text-sm text-muted-foreground">WhatsApp</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={'Search phone or message...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Channels'}</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Status'}</SelectItem>
                <SelectItem value="sent">{'Sent'}</SelectItem>
                <SelectItem value="failed">{'Failed'}</SelectItem>
                <SelectItem value="pending">{'Pending'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{'Recent Notifications'}</CardTitle>
          <CardDescription>
            {`${filteredLogs.length} entries`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {'No notifications found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{'Channel'}</TableHead>
                    <TableHead>{'Recipient'}</TableHead>
                    <TableHead>{'Type'}</TableHead>
                    <TableHead>{'Status'}</TableHead>
                    <TableHead>{'Message'}</TableHead>
                    <TableHead>{'Time'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(log.channel)}
                          <span className="capitalize">{log.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.recipient_phone}</TableCell>
                      <TableCell>{getReferenceTypeBadge(log.reference_type)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {log.message}
                        </div>
                        {log.error_message && (
                          <div className="text-xs text-red-500 mt-1">{log.error_message}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd MMM, hh:mm a')}
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
  );
}
