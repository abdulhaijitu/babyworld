import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useIncomeCategories } from '@/hooks/useIncomeCategories';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

import { ArrowDownCircle, Plus, Pencil, Trash2, Loader2, DollarSign, Ticket, UtensilsCrossed, Crown, TrendingUp } from 'lucide-react';

interface Income {
  id: string;
  income_date: string;
  category: string;
  amount: number;
  payment_method: string;
  description: string;
  notes: string | null;
  added_by_name: string | null;
  created_at: string;
}

export default function AdminIncome() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const { data: categories } = useIncomeCategories(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM'));
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    income_date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    amount: '',
    payment_method: 'cash',
    description: '',
    notes: '',
  });

  const filterStart = startOfMonth(new Date(dateFilter + '-01'));
  const filterEnd = endOfMonth(new Date(dateFilter + '-01'));

  // Manual incomes
  const { data: incomes, isLoading: incomesLoading } = useQuery({
    queryKey: ['incomes', dateFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('incomes')
        .select('*')
        .gte('income_date', format(filterStart, 'yyyy-MM-dd'))
        .lte('income_date', format(filterEnd, 'yyyy-MM-dd'))
        .order('income_date', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Income[];
    },
  });

  // Auto revenue: tickets
  const { data: ticketRevenue } = useQuery({
    queryKey: ['ticket-revenue', dateFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('total_price')
        .gte('slot_date', format(filterStart, 'yyyy-MM-dd'))
        .lte('slot_date', format(filterEnd, 'yyyy-MM-dd'))
        .neq('status', 'cancelled');
      if (error) throw error;
      return (data || []).reduce((sum, t) => sum + (Number(t.total_price) || 0), 0);
    },
  });

  // Auto revenue: food
  const { data: foodRevenue } = useQuery({
    queryKey: ['food-revenue', dateFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_orders')
        .select('total')
        .gte('created_at', filterStart.toISOString())
        .lte('created_at', filterEnd.toISOString())
        .neq('status', 'cancelled');
      if (error) throw error;
      return (data || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    },
  });

  // Auto revenue: membership
  const { data: membershipRevenue } = useQuery({
    queryKey: ['membership-revenue', dateFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_packages')
        .select('price');
      if (error) throw error;
      // Count memberships created this month
      const { data: memberships, error: memErr } = await supabase
        .from('memberships')
        .select('membership_type')
        .gte('created_at', filterStart.toISOString())
        .lte('created_at', filterEnd.toISOString())
        .neq('status', 'cancelled');
      if (memErr) throw memErr;

      // Simple estimate: count * average package price
      const packages = data || [];
      const avgPrice = packages.length > 0 ? packages.reduce((s, p) => s + Number(p.price), 0) / packages.length : 0;
      return (memberships || []).length * avgPrice;
    },
  });

  const manualTotal = useMemo(() => {
    return (incomes || []).reduce((sum, i) => sum + Number(i.amount), 0);
  }, [incomes]);

  const autoTotal = (ticketRevenue || 0) + (foodRevenue || 0) + (membershipRevenue || 0);
  const grandTotal = autoTotal + manualTotal;

  const manualCategories = useMemo(() => {
    return (categories || []).filter(c => !c.is_system);
  }, [categories]);

  const categoryLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    (categories || []).forEach(c => { map[c.name] = c.label; });
    return map;
  }, [categories]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    (categories || []).forEach(c => { map[c.name] = c.color; });
    return map;
  }, [categories]);

  // CRUD mutations
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('incomes').insert({
        income_date: data.income_date,
        category: data.category,
        amount: parseFloat(data.amount),
        payment_method: data.payment_method,
        description: data.description,
        notes: data.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Income added');
      closeDialog();
    },
    onError: () => toast.error('Failed to add income'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from('incomes')
        .update({
          income_date: data.income_date,
          category: data.category,
          amount: parseFloat(data.amount),
          payment_method: data.payment_method,
          description: data.description,
          notes: data.notes || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Income updated');
      closeDialog();
    },
    onError: () => toast.error('Failed to update income'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incomes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Income deleted');
    },
    onError: () => toast.error('Failed to delete income'),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingIncome(null);
    setFormData({ income_date: format(new Date(), 'yyyy-MM-dd'), category: '', amount: '', payment_method: 'cash', description: '', notes: '' });
  };

  const openEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormData({
      income_date: inc.income_date,
      category: inc.category,
      amount: String(inc.amount),
      payment_method: inc.payment_method,
      description: inc.description,
      notes: inc.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingIncome) {
      updateMutation.mutate({ id: editingIncome.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{grandTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Auto + Manual combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{(ticketRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Auto-tracked from tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food & Membership</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{((foodRevenue || 0) + (membershipRevenue || 0)).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Auto-tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{manualTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Manual entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Income Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Manual Income Entries</h2>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {manualCategories.map(c => (
                <SelectItem key={c.name} value={c.name}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
                <DialogDescription>
                  {editingIncome ? 'Update income entry details' : 'Record a manual income entry'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.income_date}
                      onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (৳) *</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {manualCategories.map(c => (
                        <SelectItem key={c.name} value={c.name}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Monthly investment from partner"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes (optional)"
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.category || !formData.amount || !formData.description || isPending}
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingIncome ? 'Update' : 'Add Income'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {incomesLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : incomes?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowDownCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No manual income entries this month</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes?.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(inc.income_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={categoryColorMap[inc.category] || 'bg-gray-100 text-gray-800'}>
                        {categoryLabelMap[inc.category] || inc.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{inc.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{inc.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">৳{Number(inc.amount).toLocaleString()}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(inc)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Income?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this income entry of ৳{Number(inc.amount).toLocaleString()}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(inc.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
