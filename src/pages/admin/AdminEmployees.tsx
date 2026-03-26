import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Users, 
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  CalendarDays,
  UserCheck,
  UserX,
  X,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'staff' | 'supervisor' | 'manager';
  status: 'active' | 'inactive';
  hire_date: string | null;
  notes: string | null;
  created_at: string;
}

const initialEmployeeState = {
  name: '',
  phone: '',
  email: '',
  role: 'staff' as 'staff' | 'supervisor' | 'manager',
  status: 'active' as 'active' | 'inactive',
  hire_date: new Date(),
  notes: ''
};

export default function AdminEmployees() {
  const { language } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState(initialEmployeeState);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setEmployees((data || []) as Employee[]);
    } catch (err: any) {
      console.error('[Employees] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone required');
      return;
    }

    setSaving(true);
    try {
      const employeeData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        role: formData.role,
        status: formData.status,
        hire_date: format(formData.hire_date, 'yyyy-MM-dd'),
        notes: formData.notes.trim() || null
      };

      if (editingEmployee) {
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (updateError) throw updateError;
        toast.success('Employee updated');
      } else {
        const { error: insertError } = await supabase
          .from('employees')
          .insert([employeeData]);

        if (insertError) throw insertError;
        toast.success('Employee added');
      }

      setDialogOpen(false);
      setEditingEmployee(null);
      setFormData(initialEmployeeState);
      fetchEmployees();
    } catch (err: any) {
      console.error('[Employees] Save error:', err);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', selectedEmployee.id);

      if (deleteError) throw deleteError;

      toast.success('Employee deleted');
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id));
    } catch (err: any) {
      console.error('[Employees] Delete error:', err);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    try {
      const { error: updateError } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employee.id);

      if (updateError) throw updateError;
      setEmployees(prev => prev.map(e => 
        e.id === employee.id ? { ...e, status: newStatus } : e
      ));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      phone: employee.phone,
      email: employee.email || '',
      role: employee.role,
      status: employee.status,
      hire_date: employee.hire_date ? parseISO(employee.hire_date) : new Date(),
      notes: employee.notes || ''
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const openDetailDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailDialogOpen(true);
  };

  const closeFormDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setFormData(initialEmployeeState);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!emp.name.toLowerCase().includes(query) && 
          !emp.phone.includes(query) &&
          !(emp.email?.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">{'Manager'}</Badge>;
      case 'supervisor':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{'Supervisor'}</Badge>;
      default:
        return <Badge variant="outline">{'Staff'}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-500/10 text-green-600"><UserCheck className="w-3 h-3 mr-1" /> {'Active'}</Badge>;
    }
    return <Badge variant="secondary"><UserX className="w-3 h-3 mr-1" /> {'Inactive'}</Badge>;
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const managerCount = employees.filter(e => e.role === 'manager').length;

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            {'Employees'}
          </h1>
          <p className="text-muted-foreground">
            {'Manage employee profiles'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeFormDialog()}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {'Add Employee'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee 
                  ? ('Edit Employee')
                  : ('New Employee')
                }
              </DialogTitle>
              <DialogDescription>
                {'Fill employee details'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>{'Name'} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={'Employee name'}
                />
              </div>

              <div className="space-y-2">
                <Label>{'Phone'} *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>{'Email'}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{'Role'}</Label>
                  <Select value={formData.role} onValueChange={(v: 'staff' | 'supervisor' | 'manager') => setFormData({...formData, role: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">{'Staff'}</SelectItem>
                      <SelectItem value="supervisor">{'Supervisor'}</SelectItem>
                      <SelectItem value="manager">{'Manager'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{'Status'}</Label>
                  <Select value={formData.status} onValueChange={(v: 'active' | 'inactive') => setFormData({...formData, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{'Active'}</SelectItem>
                      <SelectItem value="inactive">{'Inactive'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{'Hire Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {format(formData.hire_date, 'dd MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.hire_date}
                      onSelect={(date) => date && setFormData({...formData, hire_date: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{'Notes'}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  placeholder={'Additional notes...'}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={closeFormDialog}>
                {'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Total Employees'}</CardDescription>
            <CardTitle className="text-2xl">{employees.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Active'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Managers'}</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{managerCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{'Employee List'}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEmployees} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {'Refresh'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={'Name, phone or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Roles'}</SelectItem>
                <SelectItem value="staff">{'Staff'}</SelectItem>
                <SelectItem value="supervisor">{'Supervisor'}</SelectItem>
                <SelectItem value="manager">{'Manager'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Status'}</SelectItem>
                <SelectItem value="active">{'Active'}</SelectItem>
                <SelectItem value="inactive">{'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchEmployees} className="mt-4" size="sm">
                {'Try Again'}
              </Button>
            </div>
          ) : loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{'Name'}</TableHead>
                  <TableHead>{'Contact'}</TableHead>
                  <TableHead>{'Role'}</TableHead>
                  <TableHead>{'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} />)}
              </tbody>
            </Table>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{'No employees found'}</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  {'Clear filters'}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{'Name'}</TableHead>
                    <TableHead>{'Contact'}</TableHead>
                    <TableHead>{'Role'}</TableHead>
                    <TableHead>{'Hired'}</TableHead>
                    <TableHead>{'Status'}</TableHead>
                    <TableHead className="text-right">{'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <a href={`tel:${employee.phone}`} className="flex items-center gap-1 text-sm hover:text-primary">
                            <Phone className="w-3 h-3" /> {employee.phone}
                          </a>
                          {employee.email && (
                            <a href={`mailto:${employee.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                              <Mail className="w-3 h-3" /> {employee.email}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(employee.role)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {employee.hire_date ? format(parseISO(employee.hire_date), 'dd MMM yyyy', {
                          locale: undefined
                        }) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openDetailDialog(employee)} title={'View'}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(employee)} title={'Edit'}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => openDeleteDialog(employee)} title={'Delete'}>
                            <Trash2 className="w-4 h-4" />
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                {getRoleBadge(selectedEmployee.role)}
                {getStatusBadge(selectedEmployee.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{'Phone'}</Label>
                  <p className="font-medium">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Email'}</Label>
                  <p className="font-medium">{selectedEmployee.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Hire Date'}</Label>
                  <p className="font-medium">
                    {selectedEmployee.hire_date 
                      ? format(parseISO(selectedEmployee.hire_date), 'dd MMM yyyy', { locale: undefined })
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{'Added'}</Label>
                  <p className="font-medium">
                    {format(parseISO(selectedEmployee.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              
              {selectedEmployee.notes && (
                <div>
                  <Label className="text-muted-foreground">{'Notes'}</Label>
                  <p className="text-sm mt-1">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => handleToggleStatus(selectedEmployee!)}>
              {selectedEmployee?.status === 'active' 
                ? ('Deactivate')
                : ('Activate')
              }
            </Button>
            <Button onClick={() => { setDetailDialogOpen(false); openEditDialog(selectedEmployee!); }}>
              <Edit className="w-4 h-4 mr-2" />
              {'Edit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {'Delete Employee?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'bn' 
                ? `"${selectedEmployee?.name}" কে মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।`
                : `Are you sure you want to delete "${selectedEmployee?.name}"? This cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
