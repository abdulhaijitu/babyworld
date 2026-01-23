import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Plus, 
  Shield, 
  User,
  Mail,
  Loader2,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Briefcase,
  HardHat
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';

type UserRole = 'admin' | 'manager' | 'staff';

interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

const roleConfig: Record<UserRole, { label: string; labelBn: string; icon: React.ElementType; color: string }> = {
  admin: { label: 'Admin', labelBn: 'অ্যাডমিন', icon: Shield, color: 'bg-primary/10 text-primary border-primary/20' },
  manager: { label: 'Manager', labelBn: 'ম্যানেজার', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  staff: { label: 'Staff', labelBn: 'স্টাফ', icon: HardHat, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function AdminUsers() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('manager');

  // Fetch all users with roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserRoleRecord[];
    }
  });

  // Create user mutation - calls edge function
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password, role }: { email: string; password: string; role: UserRole }) => {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password, role }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast.success(
        language === 'bn' 
          ? `${roleConfig[newUserRole].labelBn} তৈরি হয়েছে` 
          : `${roleConfig[newUserRole].label} created successfully`
      );
      setIsAddDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('manager');
    },
    onError: (error: Error) => {
      toast.error(error.message || (language === 'bn' ? 'ইউজার তৈরি করতে সমস্যা হয়েছে' : 'Failed to create user'));
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast.success(language === 'bn' ? 'রোল সরানো হয়েছে' : 'Role removed');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error(language === 'bn' ? 'রোল সরাতে সমস্যা হয়েছে' : 'Failed to remove role');
    }
  });

  const handleCreateUser = () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error(language === 'bn' ? 'সব ফিল্ড পূরণ করুন' : 'Please fill all fields');
      return;
    }
    if (newUserPassword.length < 6) {
      toast.error(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }
    createUserMutation.mutate({ email: newUserEmail, password: newUserPassword, role: newUserRole });
  };

  // Filter users based on search and role
  const filteredUsers = userRoles?.filter(user => {
    const matchesSearch = user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Count by role
  const adminCount = userRoles?.filter(u => u.role === 'admin').length || 0;
  const managerCount = userRoles?.filter(u => u.role === 'manager').length || 0;
  const staffCount = userRoles?.filter(u => u.role === 'staff').length || 0;

  const getRoleBadge = (role: UserRole) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {language === 'bn' ? config.labelBn : config.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            {language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'অ্যাডমিন, ম্যানেজার ও স্টাফ পরিচালনা' : 'Manage admins, managers and staff'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'নতুন ইউজার' : 'New User'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                {language === 'bn' ? 'নতুন ইউজার যোগ করুন' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {language === 'bn' ? 'নতুন অ্যাডমিন, ম্যানেজার বা স্টাফ তৈরি করুন' : 'Create a new admin, manager, or staff account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  {language === 'bn' ? 'রোল' : 'Role'}
                </Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {language === 'bn' ? 'অ্যাডমিন (সম্পূর্ণ এক্সেস)' : 'Admin (Full Access)'}
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {language === 'bn' ? 'ম্যানেজার (রিপোর্ট দেখতে পারবে)' : 'Manager (Can view reports)'}
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4" />
                        {language === 'bn' ? 'স্টাফ (টিকেট ও বিক্রয়)' : 'Staff (Tickets & Sales)'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {language === 'bn' ? 'ইমেইল' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'bn' ? 'তৈরি করুন' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'অ্যাডমিন' : 'Admins'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{adminCount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'ম্যানেজার' : 'Managers'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{managerCount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <HardHat className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'স্টাফ' : 'Staff'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{staffCount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{language === 'bn' ? 'ইউজার তালিকা' : 'User List'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'সকল ইউজার ও তাদের রোল' : 'All users and their roles'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'খুঁজুন...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[180px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                  <SelectItem value="admin">{language === 'bn' ? 'অ্যাডমিন' : 'Admin'}</SelectItem>
                  <SelectItem value="manager">{language === 'bn' ? 'ম্যানেজার' : 'Manager'}</SelectItem>
                  <SelectItem value="staff">{language === 'bn' ? 'স্টাফ' : 'Staff'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'ইউজার আইডি' : 'User ID'}</TableHead>
                  <TableHead>{language === 'bn' ? 'রোল' : 'Role'}</TableHead>
                  <TableHead>{language === 'bn' ? 'যোগদান' : 'Joined'}</TableHead>
                  <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-mono text-sm">{user.user_id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role as UserRole)}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirmId(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'bn' ? 'কোনো ইউজার পাওয়া যায়নি' : 'No users found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'bn' ? 'রোল সরাতে চান?' : 'Remove Role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'bn' 
                ? 'এই ইউজারের রোল সরিয়ে দেওয়া হবে। এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।'
                : 'This will remove the role from this user. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'bn' ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && removeRoleMutation.mutate(deleteConfirmId)}
            >
              {removeRoleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'সরিয়ে দিন' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
