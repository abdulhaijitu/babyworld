import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
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
  Building,
  Users,
  Zap,
  ShoppingCart,
  Gamepad2,
  Wrench,
  Megaphone,
  MoreHorizontal,
  Banknote,
  CreditCard,
  Wallet
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent', labelBn: 'ভাড়া', icon: Building, color: 'bg-blue-100 text-blue-800' },
  { value: 'staff_salary', label: 'Staff Salary', labelBn: 'বেতন', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'utilities', label: 'Utilities', labelBn: 'ইউটিলিটি', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'food_purchase', label: 'Food Purchase', labelBn: 'খাদ্য ক্রয়', icon: ShoppingCart, color: 'bg-orange-100 text-orange-800' },
  { value: 'toys_equipment', label: 'Toys & Equipment', labelBn: 'খেলনা ও যন্ত্রপাতি', icon: Gamepad2, color: 'bg-pink-100 text-pink-800' },
  { value: 'maintenance', label: 'Maintenance', labelBn: 'রক্ষণাবেক্ষণ', icon: Wrench, color: 'bg-gray-100 text-gray-800' },
  { value: 'marketing', label: 'Marketing', labelBn: 'মার্কেটিং', icon: Megaphone, color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'Other', labelBn: 'অন্যান্য', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-800' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', labelBn: 'নগদ', icon: Banknote },
  { value: 'bank', label: 'Bank', labelBn: 'ব্যাংক', icon: CreditCard },
  { value: 'online', label: 'Online', labelBn: 'অনলাইন', icon: Wallet },
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
  const { language } = useLanguage();
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();

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
      toast.success(language === 'bn' ? 'খরচ যোগ হয়েছে' : 'Expense added successfully');
      setCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(language === 'bn' ? 'খরচ যোগ করতে ব্যর্থ' : 'Failed to add expense');
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
      toast.success(language === 'bn' ? 'খরচ আপডেট হয়েছে' : 'Expense updated successfully');
      setEditOpen(false);
      setSelectedExpense(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(language === 'bn' ? 'খরচ আপডেট করতে ব্যর্থ' : 'Failed to update expense');
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
      toast.success(language === 'bn' ? 'খরচ মুছে ফেলা হয়েছে' : 'Expense deleted successfully');
    },
    onError: (error) => {
      toast.error(language === 'bn' ? 'খরচ মুছতে ব্যর্থ' : 'Failed to delete expense');
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
    return EXPENSE_CATEGORIES.find(c => c.value === category) || EXPENSE_CATEGORIES[7];
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
            {language === 'bn' ? 'খরচ ব্যবস্থাপনা' : 'Expense Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'ব্যবসার সকল খরচ ট্র্যাক করুন' : 'Track all business expenses'}
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'নতুন খরচ' : 'Add Expense'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'bn' ? 'নতুন খরচ যোগ করুন' : 'Add New Expense'}</DialogTitle>
              <DialogDescription>
                {language === 'bn' ? 'খরচের বিবরণ পূরণ করুন' : 'Fill in the expense details'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(formData.expense_date, 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })}
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
                <Label>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'} *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {language === 'bn' ? cat.labelBn : cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'বিবরণ' : 'Description'} *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'bn' ? 'খরচের বিবরণ লিখুন' : 'Enter expense description'}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (BDT)'} *</Label>
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
                <Label>{language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(pm => (
                      <SelectItem key={pm.value} value={pm.value}>
                        <div className="flex items-center gap-2">
                          <pm.icon className="w-4 h-4" />
                          {language === 'bn' ? pm.labelBn : pm.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={language === 'bn' ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Additional notes (optional)'}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.category || !formData.description || !formData.amount || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'bn' ? 'যোগ করুন' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {language === 'bn' ? 'মোট খরচ' : 'Total Expenses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">৳{totalExpenses.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">
            {format(startDate, 'dd MMM', { locale: language === 'bn' ? bn : undefined })} - {format(endDate, 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
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
                <SelectValue placeholder={language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</SelectItem>
                {EXPENSE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === 'bn' ? cat.labelBn : cat.label}
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
              <p>{language === 'bn' ? 'কোনো খরচ নেই' : 'No expenses recorded'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</TableHead>
                    <TableHead>{language === 'bn' ? 'বিবরণ' : 'Description'}</TableHead>
                    <TableHead>{language === 'bn' ? 'পরিমাণ' : 'Amount'}</TableHead>
                    <TableHead>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</TableHead>
                    <TableHead>{language === 'bn' ? 'যোগ করেছে' : 'Added By'}</TableHead>
                    {isAdmin && <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>}
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
                          {format(new Date(expense.expense_date), 'dd MMM yyyy', { locale: language === 'bn' ? bn : undefined })}
                        </TableCell>
                        <TableCell>
                          <Badge className={catInfo.color}>
                            <CatIcon className="w-3 h-3 mr-1" />
                            {language === 'bn' ? catInfo.labelBn : catInfo.label}
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
                            {language === 'bn' ? pmInfo.labelBn : pmInfo.label}
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
                                    <AlertDialogTitle>{language === 'bn' ? 'খরচ মুছে ফেলবেন?' : 'Delete Expense?'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {language === 'bn' 
                                        ? 'এই খরচটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।'
                                        : 'This expense will be permanently deleted. This action cannot be undone.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{language === 'bn' ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(expense.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
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
            <DialogTitle>{language === 'bn' ? 'খরচ সম্পাদনা' : 'Edit Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Same form fields as create */}
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
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
              <Label>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'} *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === 'bn' ? cat.labelBn : cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিবরণ' : 'Description'} *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (BDT)'} *</Label>
              <Input
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {language === 'bn' ? pm.labelBn : pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => selectedExpense && updateMutation.mutate({ id: selectedExpense.id, ...formData })}
              disabled={!formData.category || !formData.description || !formData.amount || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'আপডেট করুন' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
