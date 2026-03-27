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
import { 
  Plus, Search, Phone, Mail, Calendar, Trash2, Edit, UserPlus, 
  Filter, Users, UserCheck, UserX, MessageSquare 
} from 'lucide-react';
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

export default function AdminLeads() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">লিড ম্যানেজমেন্ট ও ট্র্যাকিং</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />নতুন লিড</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'লিড এডিট করুন' : 'নতুন লিড যোগ করুন'}</DialogTitle>
            </DialogHeader>
            <LeadForm lead={editingLead} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">মোট লিড</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.new}</p>
              <p className="text-xs text-muted-foreground">নতুন</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.interested}</p>
              <p className="text-xs text-muted-foreground">আগ্রহী</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{stats.converted}</p>
              <p className="text-xs text-muted-foreground">কনভার্টেড</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as LeadStatus | 'all')}>
              <TabsList>
                <TabsTrigger value="all">সব</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
                <TabsTrigger value="interested">Interested</TabsTrigger>
                <TabsTrigger value="converted">Converted</TabsTrigger>
                <TabsTrigger value="lost">Lost</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Lead List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">কোনো লিড পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={lead.id}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
