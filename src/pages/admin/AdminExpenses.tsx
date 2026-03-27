import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  Receipt, 
  Plus, 
  CalendarIcon, 
  Filter, 
  Pencil, 
  Trash2, 
  Loader2,
  Banknote,
  CreditCard,
  Wallet
} from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'bank', label: 'Bank', icon: CreditCard },
  { value: 'online', label: 'Online', icon: Wallet },
];

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  added_by_name: string;
  notes: string | null;
  created_at: string;
}

export default function AdminExpenses() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const { data: dbCategories = [] } = useExpenseCategories(true);

  const expenseCategories = dbCategories.map(c => ({
    value: c.name,
    label: c.label,
    color: c.color,
  }));

  // Filters
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    expense_date: new Date(),
    category: '',
    description: '',
    amount: '',
    payment_method: 'cash',
    notes: ''
  });

  // Fetch expenses
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', startDate, endDate, categoryFilter],
    queryFn: async () => {
      const body: Record<string, unknown> = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      };
      if (categoryFilter !== 'all') {
        body.category = categoryFilter;
      }

      const { data, error } = await supabase.functions.invoke('manage-expenses?action=list', {
        body
      });
      if (error) throw error;
      return data;
    }
  });

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase.functions.invoke('manage-expenses?action=create', {
        body: {
          expense_date: format(data.expense_date, 'yyyy-MM-dd'),
          category: data.category,
          description: data.description,
          amount: parseFloat(data.amount),
          payment_method: data.payment_method,
          notes: data.notes || null,
          added_by_name: 'Admin'
        }
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added successfully');
      setCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to add expense');
      console.error(error);
    }
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & typeof formData) => {
      const { data: result, error } = await supabase.functions.invoke('manage-expenses?action=update', {
        body: {
          id: data.id,
          expense_date: format(data.expense_date, 'yyyy-MM-dd'),
          category: data.category,
          description: data.description,
          amount: parseFloat(data.amount),
          payment_method: data.payment_method,
          notes: data.notes || null
        }
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully');
      setEditOpen(false);
      setSelectedExpense(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update expense');
      console.error(error);
    }
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase.functions.invoke('manage-expenses?action=delete', {
        body: { id }
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete expense');
      console.error(error);
    }
  });

  const resetForm = () => {
    setFormData({
      expense_date: new Date(),
      category: '',
      description: '',
      amount: '',
      payment_method: 'cash',
      notes: ''
    });
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      expense_date: new Date(expense.expense_date),
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      payment_method: expense.payment_method,
      notes: expense.notes || ''
    });
    setEditOpen(true);
  };

  const getCategoryInfo = (category: string) => {
    const found = expenseCategories.find(c => c.value === category);
    return found || { value: category, label: category, color: 'bg-gray-100 text-gray-800' };
  };

  const getPaymentMethodInfo = (method: string) => {
    return PAYMENT_METHODS.find(m => m.value === method) || PAYMENT_METHODS[0];
  };

  const totalExpenses = expensesData?.expenses?.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            {'Expense Management'}
          </h1>
          <p className="text-muted-foreground">
            {'Track all business expenses'}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {'Add Expense'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{'Add New Expense'}</DialogTitle>
              <DialogDescription>
                {'Fill in the expense details'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>{'Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(formData.expense_date, 'dd MMM yyyy', { locale: undefined })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expense_date}
                      onSelect={(date) => date && setFormData({ ...formData, expense_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{'Category'} *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{'Description'} *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={'Enter expense description'}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>{'Amount (BDT)'} *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>{'Payment Method'}</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(pm => (
                      <SelectItem key={pm.value} value={pm.value}>
                        <div className="flex items-center gap-2">
                          <pm.icon className="w-4 h-4" />
                          {pm.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{'Notes'}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={'Additional notes (optional)'}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                {'Cancel'}
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.category || !formData.description || !formData.amount || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {'Add Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {'Total Expenses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">৳{totalExpenses.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">
            {format(startDate, 'dd MMM', { locale: undefined })} - {format(endDate, 'dd MMM yyyy', { locale: undefined })}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{'Filter:'}</span>
            </div>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: startDate, to: endDate }}
                  onSelect={(range) => {
                    if (range?.from) setStartDate(range.from);
                    if (range?.to) setEndDate(range.to);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={'All Categories'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Categories'}</SelectItem>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expensesData?.expenses?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{'No expenses recorded'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{'Date'}</TableHead>
                    <TableHead>{'Category'}</TableHead>
                    <TableHead>{'Description'}</TableHead>
                    <TableHead>{'Amount'}</TableHead>
                    <TableHead>{'Payment'}</TableHead>
                    <TableHead>{'Added By'}</TableHead>
                    {isAdmin && <TableHead className="text-right">{'Actions'}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesData?.expenses?.map((expense: Expense) => {
                    const catInfo = getCategoryInfo(expense.category);
                    const pmInfo = getPaymentMethodInfo(expense.payment_method);
                    const CatIcon = catInfo.icon;
                    const PmIcon = pmInfo.icon;

                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {format(new Date(expense.expense_date), 'dd MMM yyyy', { locale: undefined })}
                        </TableCell>
                        <TableCell>
                          <Badge className={catInfo.color}>
                            <CatIcon className="w-3 h-3 mr-1" />
                            {catInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{expense.description}</div>
                          {expense.notes && (
                            <div className="text-xs text-muted-foreground">{expense.notes}</div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          ৳{Number(expense.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <PmIcon className="w-3 h-3" />
                            {pmInfo.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {expense.added_by_name}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(expense)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{'Delete Expense?'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {'This expense will be permanently deleted. This action cannot be undone.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(expense.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{'Edit Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Same form fields as create */}
            <div className="space-y-2">
              <Label>{'Date'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(formData.expense_date, 'dd MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expense_date}
                    onSelect={(date) => date && setFormData({ ...formData, expense_date: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{'Category'} *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{'Description'} *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{'Amount (BDT)'} *</Label>
              <Input
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{'Payment Method'}</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>
              {'Cancel'}
            </Button>
            <Button 
              onClick={() => selectedExpense && updateMutation.mutate({ id: selectedExpense.id, ...formData })}
              disabled={!formData.category || !formData.description || !formData.amount || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
