import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_till: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '0',
  max_uses: '',
  is_active: true,
  valid_till: '',
};

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.code.trim()) throw new Error('কুপন কোড দিন');
      if (!form.discount_value || Number(form.discount_value) <= 0) throw new Error('ডিসকাউন্ট মান দিন');

      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        is_active: form.is_active,
        valid_till: form.valid_till || null,
      };

      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(editingId ? 'কুপন আপডেট হয়েছে' : 'কুপন তৈরি হয়েছে');
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('কুপন ডিলিট হয়েছে');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  const resetForm = () => {
    setForm(emptyCoupon);
    setEditingId(null);
    setDialogOpen(false);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      is_active: coupon.is_active,
      valid_till: coupon.valid_till ? coupon.valid_till.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`"${code}" কপি হয়েছে`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          Coupons
        </h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> নতুন কুপন</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'কুপন এডিট' : 'নতুন কুপন তৈরি'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>কুপন কোড</Label>
                <Input
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="mt-1 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ডিসকাউন্ট টাইপ</Label>
                  <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতকরা (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ডিসকাউন্ট মান</Label>
                  <Input
                    type="number"
                    placeholder={form.discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                    value={form.discount_value}
                    onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                    className="mt-1"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ন্যূনতম অর্ডার (৳)</Label>
                  <Input
                    type="number"
                    value={form.min_order_amount}
                    onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                    className="mt-1"
                    min="0"
                  />
                </div>
                <div>
                  <Label>সর্বোচ্চ ব্যবহার</Label>
                  <Input
                    type="number"
                    placeholder="সীমাহীন"
                    value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    className="mt-1"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label>মেয়াদ শেষ (ঐচ্ছিক)</Label>
                <Input
                  type="datetime-local"
                  value={form.valid_till}
                  onChange={e => setForm(f => ({ ...f, valid_till: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>সক্রিয়</Label>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'সেভ হচ্ছে...' : editingId ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কোড</TableHead>
                <TableHead>ডিসকাউন্ট</TableHead>
                <TableHead className="hidden sm:table-cell">ন্যূনতম অর্ডার</TableHead>
                <TableHead className="hidden md:table-cell">ব্যবহার</TableHead>
                <TableHead className="hidden md:table-cell">মেয়াদ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
              ) : coupons.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">কোনো কুপন নেই</TableCell></TableRow>
              ) : coupons.map(coupon => {
                const expired = coupon.valid_till && new Date(coupon.valid_till) < new Date();
                const limitReached = coupon.max_uses && coupon.used_count >= coupon.max_uses;
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono font-bold text-sm">{coupon.code}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCode(coupon.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `৳${coupon.discount_value}`}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">৳{coupon.min_order_amount}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {coupon.valid_till ? format(new Date(coupon.valid_till), 'dd/MM/yy hh:mm a') : '—'}
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="destructive" className="text-xs">মেয়াদ শেষ</Badge>
                      ) : limitReached ? (
                        <Badge variant="secondary" className="text-xs">সীমা শেষ</Badge>
                      ) : (
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={v => toggleActive.mutate({ id: coupon.id, is_active: v })}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => { if (confirm('ডিলিট করতে চান?')) deleteMutation.mutate(coupon.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
