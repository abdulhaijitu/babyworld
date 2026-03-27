import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, Trash2, Edit, Send, MessageSquare, Users, Clock,
  CheckCircle, XCircle, Loader2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  useSmsCampaigns, useCreateSmsCampaign, useUpdateSmsCampaign, useDeleteSmsCampaign,
  fetchAudiencePhones,
  type CampaignStatus, type CampaignAudience, type SmsCampaignInsert, type SmsCampaign
} from '@/hooks/useSmsCampaigns';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Edit },
  scheduled: { label: 'Scheduled', variant: 'outline', icon: Clock },
  sending: { label: 'Sending...', variant: 'default', icon: Loader2 },
  sent: { label: 'Sent', variant: 'default', icon: CheckCircle },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
};

const AUDIENCE_OPTIONS: { value: CampaignAudience; label: string; desc: string }[] = [
  { value: 'all_customers', label: 'সব কাস্টমার', desc: 'টিকেট, মেম্বারশিপ ও বুকিং থেকে সব ফোন নম্বর' },
  { value: 'members', label: 'সক্রিয় মেম্বার', desc: 'শুধুমাত্র অ্যাক্টিভ মেম্বারশিপ হোল্ডার' },
  { value: 'expired_members', label: 'মেয়াদোত্তীর্ণ মেম্বার', desc: 'যাদের মেম্বারশিপ শেষ হয়ে গেছে' },
  { value: 'leads', label: 'লিডস', desc: 'নতুন, যোগাযোগকৃত ও আগ্রহী লিড' },
  { value: 'event_bookings', label: 'ইভেন্ট বুকিং', desc: 'বার্থডে ইভেন্ট বুককারী' },
  { value: 'custom', label: 'কাস্টম নম্বর', desc: 'নিজে নম্বর লিখুন' },
];

const TEMPLATE_VARS = [
  { var: '{{name}}', desc: 'কাস্টমার নাম' },
  { var: '{{date}}', desc: 'আজকের তারিখ' },
];

function CampaignForm({ campaign, onClose }: { campaign?: SmsCampaign; onClose: () => void }) {
  const createCampaign = useCreateSmsCampaign();
  const updateCampaign = useUpdateSmsCampaign();
  const isEdit = !!campaign;

  const [form, setForm] = useState({
    name: campaign?.name || '',
    message: campaign?.message || '',
    audience: (campaign?.audience || 'all_customers') as CampaignAudience,
    scheduled_at: campaign?.scheduled_at ? format(new Date(campaign.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
    custom_phones: campaign?.custom_phones?.join('\n') || '',
  });

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const handlePreviewAudience = async () => {
    setLoadingCount(true);
    try {
      if (form.audience === 'custom') {
        const phones = form.custom_phones.split('\n').map(p => p.trim()).filter(Boolean);
        setPreviewCount(phones.length);
      } else {
        const phones = await fetchAudiencePhones(form.audience);
        setPreviewCount(phones.length);
      }
    } catch {
      toast.error('অডিয়েন্স লোড করতে ব্যর্থ');
    }
    setLoadingCount(false);
  };

  const charCount = form.message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;

    const customPhones = form.audience === 'custom'
      ? form.custom_phones.split('\n').map(p => p.trim()).filter(Boolean)
      : null;

    const payload: SmsCampaignInsert = {
      name: form.name.trim(),
      message: form.message.trim(),
      audience: form.audience,
      status: 'draft',
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      total_recipients: previewCount || 0,
      custom_phones: customPhones,
      created_by: null,
    };

    if (isEdit && campaign) {
      updateCampaign.mutate({ id: campaign.id, updates: payload }, { onSuccess: onClose });
    } else {
      createCampaign.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">ক্যাম্পেইন নাম *</Label>
        <Input id="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required maxLength={150} placeholder="যেমন: ঈদ স্পেশাল অফার" />
      </div>

      <div className="space-y-2">
        <Label>অডিয়েন্স *</Label>
        <Select value={form.audience} onValueChange={v => { setForm(p => ({ ...p, audience: v as CampaignAudience })); setPreviewCount(null); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUDIENCE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>
                <div>
                  <span className="font-medium">{o.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {o.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handlePreviewAudience} disabled={loadingCount}>
            {loadingCount ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Users className="h-3 w-3 mr-1" />}
            প্রাপক সংখ্যা দেখুন
          </Button>
          {previewCount !== null && (
            <Badge variant="secondary">{previewCount} জন প্রাপক</Badge>
          )}
        </div>
      </div>

      {form.audience === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="custom_phones">ফোন নম্বর (প্রতি লাইনে একটি)</Label>
          <Textarea id="custom_phones" value={form.custom_phones} onChange={e => setForm(p => ({ ...p, custom_phones: e.target.value }))} rows={4} placeholder="01712345678&#10;01812345678&#10;01912345678" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="message">মেসেজ *</Label>
          <span className="text-xs text-muted-foreground">{charCount} অক্ষর • {smsCount} SMS</span>
        </div>
        <Textarea id="message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required maxLength={1600} rows={4} placeholder="আপনার SMS মেসেজ লিখুন..." />
        <div className="flex gap-1 flex-wrap">
          {TEMPLATE_VARS.map(tv => (
            <Badge key={tv.var} variant="outline" className="cursor-pointer text-xs" onClick={() => setForm(p => ({ ...p, message: p.message + ' ' + tv.var }))}>
              {tv.var} <span className="ml-1 text-muted-foreground">({tv.desc})</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">শিডিউল (ঐচ্ছিক)</Label>
        <Input id="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
        <p className="text-xs text-muted-foreground">খালি রাখলে ম্যানুয়ালি পাঠাতে হবে</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>বাতিল</Button>
        <Button type="submit" disabled={createCampaign.isPending || updateCampaign.isPending}>
          {isEdit ? 'আপডেট' : 'তৈরি করুন'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminSmsCampaigns() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SmsCampaign | undefined>();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: campaigns = [], isLoading } = useSmsCampaigns(statusFilter);
  const deleteCampaign = useDeleteSmsCampaign();
  const updateCampaign = useUpdateSmsCampaign();

  const filtered = campaigns.filter(c => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalSms: campaigns.reduce((acc, c) => acc + c.sent_count, 0),
  };

  const openEdit = (c: SmsCampaign) => { setEditingCampaign(c); setDialogOpen(true); };
  const openNew = () => { setEditingCampaign(undefined); setDialogOpen(true); };
  const handleClose = () => { setDialogOpen(false); setEditingCampaign(undefined); };

  const handleSendCampaign = async (campaign: SmsCampaign) => {
    if (!confirm(`"${campaign.name}" ক্যাম্পেইনের SMS পাঠাতে চান?`)) return;

    setSendingId(campaign.id);
    try {
      // Update status to sending
      await supabase.from('sms_campaigns').update({ status: 'sending' } as any).eq('id', campaign.id);

      // Get audience phones
      let phones: string[];
      if (campaign.audience === 'custom' && campaign.custom_phones) {
        phones = campaign.custom_phones.filter(Boolean);
      } else {
        phones = await fetchAudiencePhones(campaign.audience);
      }

      if (phones.length === 0) {
        toast.error('কোনো প্রাপক পাওয়া যায়নি');
        await supabase.from('sms_campaigns').update({ status: 'draft' } as any).eq('id', campaign.id);
        setSendingId(null);
        return;
      }

      let sentCount = 0;
      let failedCount = 0;

      // Send SMS to each phone
      for (const phone of phones) {
        try {
          const { data } = await supabase.functions.invoke('send-sms', {
            body: { phone, message: campaign.message },
          });
          if (data?.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      // Update campaign with results
      await supabase.from('sms_campaigns').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_recipients: phones.length,
        sent_count: sentCount,
        failed_count: failedCount,
      } as any).eq('id', campaign.id);

      toast.success(`${sentCount}/${phones.length} SMS সফলভাবে পাঠানো হয়েছে`);
    } catch (err: any) {
      toast.error('ক্যাম্পেইন পাঠাতে ব্যর্থ: ' + err.message);
      await supabase.from('sms_campaigns').update({ status: 'failed' } as any).eq('id', campaign.id);
    }

    setSendingId(null);
    // Refresh
    window.location.reload();
  };

  const getAudienceLabel = (audience: CampaignAudience) =>
    AUDIENCE_OPTIONS.find(o => o.value === audience)?.label || audience;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">SMS Campaigns</h1>
          <p className="text-muted-foreground">বাল্ক SMS পাঠানো ও ক্যাম্পেইন ট্র্যাকিং</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />নতুন ক্যাম্পেইন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'ক্যাম্পেইন এডিট' : 'নতুন ক্যাম্পেইন তৈরি'}</DialogTitle>
            </DialogHeader>
            <CampaignForm campaign={editingCampaign} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">মোট ক্যাম্পেইন</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
          <div><p className="text-2xl font-bold">{stats.sent}</p><p className="text-xs text-muted-foreground">পাঠানো হয়েছে</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Edit className="h-8 w-8 text-amber-500" />
          <div><p className="text-2xl font-bold">{stats.draft}</p><p className="text-xs text-muted-foreground">ড্রাফট</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Send className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{stats.totalSms}</p><p className="text-xs text-muted-foreground">মোট SMS পাঠানো</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ক্যাম্পেইন খুঁজুন..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as CampaignStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">সব</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent></Card>

      {/* Campaign List */}
      <Card><CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">কোনো ক্যাম্পেইন পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ক্যাম্পেইন</TableHead>
                  <TableHead>অডিয়েন্স</TableHead>
                  <TableHead>প্রাপক</TableHead>
                  <TableHead>ডেলিভারি</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(campaign => {
                  const statusInfo = STATUS_CONFIG[campaign.status];
                  const StatusIcon = statusInfo.icon;
                  const deliveryPercent = campaign.total_recipients > 0
                    ? Math.round((campaign.sent_count / campaign.total_recipients) * 100)
                    : 0;
                  const isSending = sendingId === campaign.id;

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{campaign.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAudienceLabel(campaign.audience)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{campaign.total_recipients}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campaign.status === 'sent' ? (
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between text-xs">
                              <span className="text-emerald-600">{campaign.sent_count} সফল</span>
                              {campaign.failed_count > 0 && <span className="text-destructive">{campaign.failed_count} ব্যর্থ</span>}
                            </div>
                            <Progress value={deliveryPercent} className="h-1.5" />
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className={`h-3 w-3 ${campaign.status === 'sending' ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{format(new Date(campaign.created_at), 'dd MMM yyyy')}</span>
                          {campaign.sent_at && <span className="text-xs">পাঠানো: {format(new Date(campaign.sent_at), 'dd MMM HH:mm')}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {campaign.status === 'draft' && (
                            <Button variant="default" size="sm" onClick={() => handleSendCampaign(campaign)} disabled={isSending}>
                              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                              পাঠান
                            </Button>
                          )}
                          {campaign.status === 'draft' && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(campaign)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm('এই ক্যাম্পেইন ডিলিট করতে চান?')) deleteCampaign.mutate(campaign.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>

      {/* Info Note */}
      <Card><CardContent className="p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">SMS পাঠানোর জন্য আপনার SMS API কনফিগার করা থাকতে হবে।</p>
          <p>SMS_API_KEY, SMS_SENDER_ID এবং SMS_API_URL সেটিংসে কনফিগার করুন।</p>
        </div>
      </CardContent></Card>
    </div>
  );
}
