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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Add Expense</span>
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
        <CardContent className="p-3">
          <p className="text-[10px] lg:text-xs text-muted-foreground">Total Expenses</p>
          <div className="text-2xl lg:text-3xl font-bold text-destructive">৳{totalExpenses.toLocaleString()}</div>
          <p className="text-[10px] lg:text-sm text-muted-foreground">
            {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM yyyy')}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs lg:text-sm w-full lg:w-auto">
                    <CalendarIcon className="w-3 h-3 mr-1 lg:w-4 lg:h-4 lg:mr-2" />
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
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs lg:text-sm lg:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (<Skeleton key={i} className="h-12 w-full" />))}
            </div>
          ) : expensesData?.expenses?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y">
                {expensesData?.expenses?.map((expense: Expense) => {
                  const catInfo = getCategoryInfo(expense.category);
                  return (
                    <div key={expense.id} className="p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{format(new Date(expense.expense_date), 'dd MMM yyyy')}</span>
                        <Badge className={`${catInfo.color} text-[10px] px-1.5 py-0`}>{catInfo.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate mr-2">{expense.description}</span>
                        <span className="font-semibold text-destructive text-sm whitespace-nowrap">৳{Number(expense.amount).toLocaleString()}</span>
                      </div>
                      {expense.notes && <p className="text-[10px] text-muted-foreground">{expense.notes}</p>}
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1 pt-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(expense)}><Pencil className="w-3 h-3" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete Expense?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(expense.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Payment</TableHead><TableHead>Added By</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData?.expenses?.map((expense: Expense) => {
                      const catInfo = getCategoryInfo(expense.category);
                      const pmInfo = getPaymentMethodInfo(expense.payment_method);
                      const PmIcon = pmInfo.icon;
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{format(new Date(expense.expense_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell><Badge className={catInfo.color}>{catInfo.label}</Badge></TableCell>
                          <TableCell><div>{expense.description}</div>{expense.notes && <div className="text-xs text-muted-foreground">{expense.notes}</div>}</TableCell>
                          <TableCell className="font-semibold text-destructive">৳{Number(expense.amount).toLocaleString()}</TableCell>
                          <TableCell><div className="flex items-center gap-1 text-sm"><PmIcon className="w-3 h-3" />{pmInfo.label}</div></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{expense.added_by_name}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(expense)}><Pencil className="w-3 h-3" /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Expense?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(expense.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
            </>
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
                  {expenseCategories.map(cat => (
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
