import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Plus, Search, Phone, Mail, Calendar, Trash2, Edit, UserPlus, 
  Filter, Users, UserCheck, UserX, MessageSquare, Send, Loader2, Megaphone
} from 'lucide-react';
import { useSendSMS } from '@/hooks/useSendSMS';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, type LeadStatus, type LeadSource, type LeadInsert, type Lead } from '@/hooks/useLeads';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  interested: { label: 'Interested', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Phone' },
  { value: 'other', label: 'Other' },
];

const INTERESTED_OPTIONS = [
  'Birthday Party',
  'Membership',
  'Play Session',
  'Private Event',
  'Food & Beverage',
  'Other',
];

function LeadForm({ lead, onClose }: { lead?: Lead; onClose: () => void }) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isEdit = !!lead;

  const [form, setForm] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    source: (lead?.source || 'other') as LeadSource,
    status: (lead?.status || 'new') as LeadStatus,
    notes: lead?.notes || '',
    follow_up_date: lead?.follow_up_date || '',
    interested_in: lead?.interested_in || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    const payload: LeadInsert = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      source: form.source,
      status: form.status,
      notes: form.notes.trim() || null,
      follow_up_date: form.follow_up_date || null,
      interested_in: form.interested_in || null,
      created_by: null,
    };

    if (isEdit && lead) {
      updateLead.mutate({ id: lead.id, updates: payload }, { onSuccess: onClose });
    } else {
      createLead.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">নাম *</Label>
          <Input id="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">ফোন *</Label>
          <Input id="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required maxLength={20} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} maxLength={255} />
        </div>
        <div className="space-y-2">
          <Label>সোর্স</Label>
          <Select value={form.source} onValueChange={v => setForm(p => ({ ...p, source: v as LeadSource }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>স্ট্যাটাস</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as LeadStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>আগ্রহ</Label>
          <Select value={form.interested_in} onValueChange={v => setForm(p => ({ ...p, interested_in: v }))}>
            <SelectTrigger><SelectValue placeholder="সিলেক্ট করুন" /></SelectTrigger>
            <SelectContent>
              {INTERESTED_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow_up">ফলো-আপ তারিখ</Label>
          <Input id="follow_up" type="date" value={form.follow_up_date} onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} maxLength={1000} rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>বাতিল</Button>
        <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
          {isEdit ? 'আপডেট' : 'যোগ করুন'}
        </Button>
      </div>
    </form>
  );
}
function SMSButton({ phone, name }: { phone: string; name: string }) {
  const { sendSMS, sending } = useSendSMS();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`প্রিয় ${name},\nBaby World-এ আপনাকে স্বাগতম! আমাদের নতুন অফার ও প্যাকেজ সম্পর্কে জানতে ভিজিট করুন।\n📍 Baby World Indoor Playground`);

  const handleSend = async () => {
    const result = await sendSMS(phone, message);
    if (result.success) {
      toast.success(`${name}-কে SMS পাঠানো হয়েছে`);
      setOpen(false);
    } else {
      toast.error('SMS পাঠাতে ব্যর্থ: ' + (result.error || result.message));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="SMS পাঠান">
          <Send className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>SMS পাঠান — {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {phone}
          </div>
          <div className="space-y-2">
            <Label>মেসেজ</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} maxLength={1600} />
            <p className="text-xs text-muted-foreground text-right">{message.length}/1600</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              পাঠান
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppLeadButton({ phone, name }: { phone: string; name: string }) {
  const message = `প্রিয় ${name},\nBaby World-এ আপনাকে স্বাগতম! আমাদের নতুন অফার ও প্যাকেজ সম্পর্কে জানতে ভিজিট করুন।\n📍 Baby World Indoor Playground\n📞 +880 9606990128`;

  const handleClick = () => {
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '88' + formattedPhone;
    } else if (!formattedPhone.startsWith('88')) {
      formattedPhone = '88' + formattedPhone;
    }
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success(`${name}-এর WhatsApp খোলা হয়েছে`);
  };

  return (
    <Button variant="ghost" size="icon" title="WhatsApp-এ মেসেজ পাঠান" onClick={handleClick} className="text-green-600 hover:text-green-700">
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}

function BulkMessageDialog({ leads, onClose }: { leads: Lead[]; onClose: () => void }) {
  const { sendSMS, sending } = useSendSMS();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [message, setMessage] = useState('প্রিয় গ্রাহক,\nBaby World-এ আপনাকে স্বাগতম! আমাদের নতুন অফার ও প্যাকেজ সম্পর্কে জানতে ভিজিট করুন।\n📍 Baby World Indoor Playground\n📞 +880 9606990128');
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [isSending, setIsSending] = useState(false);

  const formatPhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '88' + p;
    else if (!p.startsWith('88')) p = '88' + p;
    return p;
  };

  const handleBulkWhatsApp = () => {
    const phones = leads.map(l => formatPhone(l.phone));
    if (phones.length > 0) {
      const url = `https://wa.me/${phones[0]}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    leads.forEach((lead, i) => {
      if (i === 0) return;
      setTimeout(() => {
        const url = `https://wa.me/${formatPhone(lead.phone)}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }, i * 1500);
    });
    toast.success(`${leads.length}টি WhatsApp উইন্ডো খোলা হচ্ছে`);
    setOpen(false);
    onClose();
  };

  const handleBulkSMS = async () => {
    setIsSending(true);
    setProgress({ sent: 0, failed: 0, total: leads.length });
    let sent = 0, failed = 0;
    for (const lead of leads) {
      const personalMsg = message.replace('গ্রাহক', lead.name);
      const result = await sendSMS(lead.phone, personalMsg);
      if (result.success) sent++;
      else failed++;
      setProgress({ sent, failed, total: leads.length });
    }
    setIsSending(false);
    toast.success(`SMS পাঠানো সম্পন্ন: ${sent} সফল, ${failed} ব্যর্থ`);
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Megaphone className="h-4 w-4 mr-2" />
          বাল্ক মেসেজ ({leads.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>বাল্ক মেসেজ পাঠান — {leads.length}টি লিড</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>চ্যানেল</Label>
            <Select value={channel} onValueChange={v => setChannel(v as 'sms' | 'whatsapp')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>মেসেজ</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} maxLength={1600} />
            <p className="text-xs text-muted-foreground text-right">{message.length}/1600</p>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">প্রাপকগণ ({leads.length}জন):</p>
            <div className="max-h-24 overflow-y-auto space-y-0.5">
              {leads.map(l => (
                <p key={l.id} className="text-muted-foreground">{l.name} — {l.phone}</p>
              ))}
            </div>
          </div>

          {isSending && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p>প্রগতি: {progress.sent + progress.failed}/{progress.total}</p>
              <p className="text-green-600">সফল: {progress.sent}</p>
              {progress.failed > 0 && <p className="text-red-600">ব্যর্থ: {progress.failed}</p>}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button
              onClick={channel === 'whatsapp' ? handleBulkWhatsApp : handleBulkSMS}
              disabled={isSending || !message.trim()}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              {channel === 'whatsapp' ? 'WhatsApp পাঠান' : 'SMS পাঠান'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminLeads() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: leads = [], isLoading } = useLeads(statusFilter);
  const deleteLead = useDeleteLead();

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.email?.toLowerCase().includes(q))
    );
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    interested: leads.filter(l => l.status === 'interested').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingLead(undefined);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingLead(undefined);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const selectedLeads = filteredLeads.filter(l => selectedIds.has(l.id));

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-end gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="sm">
              <Plus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">নতুন লিড</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'লিড এডিট করুন' : 'নতুন লিড যোগ করুন'}</DialogTitle>
            </DialogHeader>
            <LeadForm lead={editingLead} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - always 4 cols compact */}
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">মোট লিড</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">নতুন</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold text-green-600">{stats.interested}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">আগ্রহী</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <p className="text-lg lg:text-2xl font-bold text-emerald-600">{stats.converted}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">কনভার্টেড</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-8 lg:h-10"
              />
            </div>
            <ScrollArea className="w-full">
              <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as LeadStatus | 'all')}>
                <TabsList className="w-max">
                  <TabsTrigger value="all" className="text-xs px-2 lg:px-3">সব</TabsTrigger>
                  <TabsTrigger value="new" className="text-xs px-2 lg:px-3">New</TabsTrigger>
                  <TabsTrigger value="contacted" className="text-xs px-2 lg:px-3">Contacted</TabsTrigger>
                  <TabsTrigger value="interested" className="text-xs px-2 lg:px-3">Interested</TabsTrigger>
                  <TabsTrigger value="converted" className="text-xs px-2 lg:px-3">Converted</TabsTrigger>
                  <TabsTrigger value="lost" className="text-xs px-2 lg:px-3">Lost</TabsTrigger>
                </TabsList>
              </Tabs>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">{selectedIds.size}টি লিড সিলেক্টেড</span>
            <BulkMessageDialog leads={selectedLeads} onClose={() => setSelectedIds(new Set())} />
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>সিলেকশন বাতিল</Button>
          </CardContent>
        </Card>
      )}

      {/* Lead List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">কোনো লিড পাওয়া যায়নি</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="p-2.5 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedIds.has(lead.id)}
                        onCheckedChange={() => toggleSelect(lead.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-sm truncate">{lead.name}</span>
                          <Badge className={`${STATUS_CONFIG[lead.status].color} text-[10px] px-1.5 py-0`}>
                            {STATUS_CONFIG[lead.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-0.5 hover:text-primary">
                            <Phone className="h-3 w-3" />{lead.phone}
                          </a>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">{lead.source.replace('_', ' ')}</Badge>
                        </div>
                        {lead.interested_in && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lead.interested_in}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(lead.created_at), 'dd MMM yyyy')}
                            {lead.follow_up_date && (
                              <span className="ml-1">· F/U: {format(new Date(lead.follow_up_date), 'dd MMM')}</span>
                            )}
                          </span>
                          <div className="flex gap-0.5">
                            <SMSButton phone={lead.phone} name={lead.name} />
                            <WhatsAppLeadButton phone={lead.phone} name={lead.name} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(lead)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('এই লিড ডিলিট করতে চান?')) {
                                  deleteLead.mutate(lead.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>নাম</TableHead>
                      <TableHead>যোগাযোগ</TableHead>
                      <TableHead>সোর্স</TableHead>
                      <TableHead>আগ্রহ</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>ফলো-আপ</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map(lead => (
                      <TableRow key={lead.id} className={selectedIds.has(lead.id) ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                            {lead.email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{lead.email}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{lead.source.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{lead.interested_in || '-'}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[lead.status].color}>
                            {STATUS_CONFIG[lead.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.follow_up_date ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(lead.follow_up_date), 'dd MMM yyyy')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <SMSButton phone={lead.phone} name={lead.name} />
                            <WhatsAppLeadButton phone={lead.phone} name={lead.name} />
                            <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('এই লিড ডিলিট করতে চান?')) {
                                  deleteLead.mutate(lead.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
