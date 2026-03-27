import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { Tags, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminExpenseCategories() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: 'receipt',
    color: 'bg-gray-100 text-gray-800',
  });

  const COLOR_OPTIONS = [
    { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' },
    { value: 'bg-orange-100 text-orange-800', label: 'Orange' },
    { value: 'bg-pink-100 text-pink-800', label: 'Pink' },
    { value: 'bg-green-100 text-green-800', label: 'Green' },
    { value: 'bg-red-100 text-red-800', label: 'Red' },
    { value: 'bg-gray-100 text-gray-800', label: 'Gray' },
    { value: 'bg-slate-100 text-slate-800', label: 'Slate' },
    { value: 'bg-teal-100 text-teal-800', label: 'Teal' },
  ];

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('expense_categories').insert({
        name: data.name.toLowerCase().replace(/\s+/g, '_'),
        label: data.label,
        icon: data.icon,
        color: data.color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category added');
      closeDialog();
    },
    onError: (err: Error) => {
      toast.error(err.message.includes('duplicate') ? 'Category name already exists' : 'Failed to add category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from('expense_categories')
        .update({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon,
          color: data.color,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category updated');
      closeDialog();
    },
    onError: () => toast.error('Failed to update category'),
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expense_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', label: '', icon: 'receipt', color: 'bg-gray-100 text-gray-800' });
  };

  const openEdit = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, label: cat.label, icon: cat.icon, color: cat.color });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="w-6 h-6" />
            Expense Categories
          </h1>
          <p className="text-muted-foreground">Manage expense categories for tracking</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details' : 'Create a new expense category'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. Staff Salary"
                />
              </div>

              <div className="space-y-2">
                <Label>System Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. staff_salary"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Used internally. Auto-generated from label.</p>
              </div>

              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. building, users, zap"
                />
                <p className="text-xs text-muted-foreground">Lucide icon name (lowercase)</p>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${c.value} border-2 transition-all ${
                        formData.color === c.value ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.label || !formData.name || isPending}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCategory ? 'Update' : 'Add Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No categories found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>System Name</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.label}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{cat.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cat.icon}</TableCell>
                    <TableCell>
                      <Badge className={cat.color}>{cat.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={cat.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: cat.id, is_active: checked })}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
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
                                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{cat.label}". Existing expenses with this category won't be affected.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(cat.id)}
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
