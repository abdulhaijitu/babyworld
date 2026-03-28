import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, Trash2, Edit, Tag, Percent, Calendar, Eye,
  Pause, Play, Zap, Gift, ShoppingBag, Ticket, UtensilsCrossed, PartyPopper, Crown
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import {
  usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion,
  type PromoStatus, type PromoDiscountType, type PromoApplicableTo,
  type PromotionInsert, type Promotion
} from '@/hooks/usePromotions';

const STATUS_CONFIG: Record<PromoStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'outline' },
  expired: { label: 'Expired', variant: 'destructive' },
};

const APPLICABLE_OPTIONS: { value: PromoApplicableTo; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Gift },
  { value: 'ticket', label: 'Ticket', icon: Ticket },
  { value: 'food', label: 'Food', icon: UtensilsCrossed },
  { value: 'event', label: 'Event', icon: PartyPopper },
  { value: 'membership', label: 'Membership', icon: Crown },
];

function PromotionForm({ promo, onClose }: { promo?: Promotion; onClose: () => void }) {
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const isEdit = !!promo;

  const [form, setForm] = useState({
    title: promo?.title || '',
    description: promo?.description || '',
    promo_code: promo?.promo_code || '',
    discount_type: (promo?.discount_type || 'percentage') as PromoDiscountType,
    discount_value: promo?.discount_value || 0,
    applicable_to: (promo?.applicable_to || 'all') as PromoApplicableTo,
    status: (promo?.status || 'draft') as PromoStatus,
    start_date: promo?.start_date ? format(new Date(promo.start_date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_date: promo?.end_date ? format(new Date(promo.end_date), "yyyy-MM-dd'T'HH:mm") : '',
    max_uses: promo?.max_uses ?? '',
    is_featured: promo?.is_featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload: PromotionInsert = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      promo_code: form.promo_code.trim().toUpperCase() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      applicable_to: form.applicable_to,
      status: form.status,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_featured: form.is_featured,
      created_by: null,
    };

    if (isEdit && promo) {
      updatePromo.mutate({ id: promo.id, updates: payload }, { onSuccess: onClose });
    } else {
      createPromo.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required maxLength={150} placeholder="e.g. Eid Special 20% Off" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} maxLength={500} rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo_code">Promo Code</Label>
          <Input id="promo_code" value={form.promo_code} onChange={e => setForm(p => ({ ...p, promo_code: e.target.value.toUpperCase() }))} maxLength={30} placeholder="EID2025" className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label>Applicable To</Label>
          <Select value={form.applicable_to} onValueChange={v => setForm(p => ({ ...p, applicable_to: v as PromoApplicableTo }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {APPLICABLE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Discount Type</Label>
          <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v as PromoDiscountType }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount_value">Discount Value</Label>
          <Input id="discount_value" type="number" min={0} max={form.discount_type === 'percentage' ? 100 : 100000} value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start *</Label>
          <Input id="start_date" type="datetime-local" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End</Label>
          <Input id="end_date" type="datetime-local" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_uses">Max Uses</Label>
          <Input id="max_uses" type="number" min={0} value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} placeholder="Unlimited" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as PromoStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="featured" checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} />
          <Label htmlFor="featured">Featured Promotion</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createPromo.isPending || updatePromo.isPending}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminPromotions() {
  const [statusFilter, setStatusFilter] = useState<PromoStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | undefined>();

  const { data: promotions = [], isLoading } = usePromotions(statusFilter);
  const deletePromo = useDeletePromotion();
  const updatePromo = useUpdatePromotion();

  const filtered = promotions.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.promo_code?.toLowerCase().includes(q));
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.status === 'active').length,
    draft: promotions.filter(p => p.status === 'draft').length,
    expired: promotions.filter(p => p.status === 'expired').length,
  };

  const openEdit = (promo: Promotion) => { setEditingPromo(promo); setDialogOpen(true); };
  const openNew = () => { setEditingPromo(undefined); setDialogOpen(true); };
  const handleClose = () => { setDialogOpen(false); setEditingPromo(undefined); };

  const toggleStatus = (promo: Promotion) => {
    const newStatus: PromoStatus = promo.status === 'active' ? 'paused' : 'active';
    updatePromo.mutate({ id: promo.id, updates: { status: newStatus } });
  };

  const formatDiscount = (p: Promotion) =>
    p.discount_type === 'percentage' ? `${p.discount_value}%` : `৳${p.discount_value}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Promotion</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
            </DialogHeader>
            <PromotionForm promo={editingPromo} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 lg:gap-4">
        <Card><CardContent className="p-2 lg:p-4 flex items-center gap-2 lg:gap-3">
          <Tag className="h-5 w-5 lg:h-8 lg:w-8 text-primary hidden lg:block" />
          <div><p className="text-lg lg:text-2xl font-bold">{stats.total}</p><p className="text-[10px] lg:text-xs text-muted-foreground">Total</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-2 lg:p-4 flex items-center gap-2 lg:gap-3">
          <Zap className="h-5 w-5 lg:h-8 lg:w-8 text-emerald-500 hidden lg:block" />
          <div><p className="text-lg lg:text-2xl font-bold">{stats.active}</p><p className="text-[10px] lg:text-xs text-muted-foreground">Active</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-2 lg:p-4 flex items-center gap-2 lg:gap-3">
          <Edit className="h-5 w-5 lg:h-8 lg:w-8 text-amber-500 hidden lg:block" />
          <div><p className="text-lg lg:text-2xl font-bold">{stats.draft}</p><p className="text-[10px] lg:text-xs text-muted-foreground">Draft</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-2 lg:p-4 flex items-center gap-2 lg:gap-3">
          <Calendar className="h-5 w-5 lg:h-8 lg:w-8 text-destructive hidden lg:block" />
          <div><p className="text-lg lg:text-2xl font-bold">{stats.expired}</p><p className="text-[10px] lg:text-xs text-muted-foreground">Expired</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title or code..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as PromoStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent></Card>

      {/* List */}
      <Card><CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No promotions found</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden p-3 space-y-2">
              {filtered.map(promo => (
                <div key={promo.id} className="border rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{promo.title}</p>
                      {promo.is_featured && <Badge variant="outline" className="text-[10px] mt-0.5">⭐ Featured</Badge>}
                    </div>
                    <Badge variant={STATUS_CONFIG[promo.status].variant} className="text-[10px] ml-2">
                      {STATUS_CONFIG[promo.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {promo.promo_code && <Badge variant="secondary" className="font-mono text-[10px]">{promo.promo_code}</Badge>}
                      <span className="font-semibold">{formatDiscount(promo)}</span>
                    </div>
                    <span className="text-muted-foreground">{promo.usage_count}{promo.max_uses ? `/${promo.max_uses}` : ''} used</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-0.5">
                    {(promo.status === 'active' || promo.status === 'paused') && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatus(promo)}>
                        {promo.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(promo)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm('Delete this promotion?')) deletePromo.mutate(promo.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Applicable</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(promo => {
                    const applicableInfo = APPLICABLE_OPTIONS.find(o => o.value === promo.applicable_to);
                    return (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{promo.title}</p>
                            {promo.description && <p className="text-xs text-muted-foreground line-clamp-1">{promo.description}</p>}
                            {promo.is_featured && <Badge variant="outline" className="mt-1 text-xs">⭐ Featured</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {promo.promo_code ? (
                            <Badge variant="secondary" className="font-mono">{promo.promo_code}</Badge>
                          ) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 font-semibold">
                            {promo.discount_type === 'percentage' ? <Percent className="h-3 w-3" /> : <span>৳</span>}
                            {formatDiscount(promo)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {applicableInfo?.label || promo.applicable_to}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-0.5">
                            <span>{format(new Date(promo.start_date), 'dd MMM yyyy')}</span>
                            {promo.end_date && (
                              <span className="text-muted-foreground">
                                → {format(new Date(promo.end_date), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {promo.usage_count}{promo.max_uses ? `/${promo.max_uses}` : ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_CONFIG[promo.status].variant}>
                            {STATUS_CONFIG[promo.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {(promo.status === 'active' || promo.status === 'paused') && (
                              <Button variant="ghost" size="icon" onClick={() => toggleStatus(promo)} title={promo.status === 'active' ? 'Pause' : 'Activate'}>
                                {promo.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => openEdit(promo)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                              onClick={() => { if (confirm('Delete this promotion?')) deletePromo.mutate(promo.id); }}>
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
          </>
        )}
      </CardContent></Card>
    </div>
  );
}