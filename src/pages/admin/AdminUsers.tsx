import { useState, useMemo } from 'react';
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
  HardHat,
  Crown,
  KeyRound,
  Building,
  Megaphone,
  Ticket,
  LogIn,
  UtensilsCrossed,
  CalendarDays,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { type AppRole } from '@/hooks/useUserRoles';

interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
  full_name?: string;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; color: string; description: string }> = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', description: 'Full system control' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-primary/10 text-primary border-primary/20', description: 'Full access' },
  management: { label: 'Management', icon: Building, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', description: 'All modules (no delete)' },
  manager: { label: 'Manager', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', description: 'HR, Accounts, Reports' },
  sales_marketing: { label: 'Sales & Marketing', icon: Megaphone, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', description: 'Leads, Promotions, SMS' },
  ticket_counterman: { label: 'Ticket Counterman', icon: Ticket, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', description: 'Ticket creation & list' },
  gateman: { label: 'Gateman', icon: LogIn, color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', description: 'Gate entry & scan' },
  food_manager: { label: 'Food Manager', icon: UtensilsCrossed, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', description: 'Food POS, Orders, Items' },
  food_staff: { label: 'Food Staff', icon: UtensilsCrossed, color: 'bg-pink-500/10 text-pink-600 border-pink-500/20', description: 'Food POS & Orders' },
  booking_manager: { label: 'Booking Manager', icon: CalendarDays, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', description: 'Event bookings & packages' },
  accountant: { label: 'Accountant', icon: Wallet, color: 'bg-lime-500/10 text-lime-600 border-lime-500/20', description: 'Income, Expenses, Reports' },
  hr_manager: { label: 'HR Manager', icon: Briefcase, color: 'bg-sky-500/10 text-sky-600 border-sky-500/20', description: 'Employees, Attendance, Payroll' },
  staff: { label: 'Staff', icon: HardHat, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', description: 'Tickets & Sales' },
  user: { label: 'User', icon: User, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', description: 'Basic user' },
};

// Roles available for creation (super_admin hidden from select but shown in list)
const creatableRoles: AppRole[] = [
  'admin', 'management', 'manager', 'sales_marketing', 'ticket_counterman',
  'gateman', 'food_manager', 'food_staff', 'booking_manager', 'accountant', 'hr_manager', 'staff'
];

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('manager');

  // Fetch profiles for email/name lookup
  const { data: profiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      if (error) throw error;
      return data as { id: string; email: string | null; full_name: string | null }[];
    }
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, { email: string | null; full_name: string | null }>();
    profiles?.forEach(p => map.set(p.id, { email: p.email, full_name: p.full_name }));
    return map;
  }, [profiles]);

  // Fetch all users with roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as UserRoleRecord[]).map(r => ({
        ...r,
        email: profileMap.get(r.user_id)?.email || undefined,
        full_name: profileMap.get(r.user_id)?.full_name || undefined,
      }));
    },
    enabled: !!profiles,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password, role, full_name }: { email: string; password: string; role: AppRole; full_name?: string }) => {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password, role, full_name }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast.success(`${roleConfig[newUserRole].label} created successfully`);
      setIsAddDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('manager');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
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
      toast.success('Role removed');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to remove role');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { user_id: userId, password }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      setResetPasswordUserId(null);
      setResetNewPassword('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    }
  });

  const handleCreateUser = () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newUserPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    createUserMutation.mutate({ email: newUserEmail, password: newUserPassword, role: newUserRole });
  };

  const handleResetPassword = () => {
    if (!resetNewPassword || resetNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (resetPasswordUserId) {
      resetPasswordMutation.mutate({ userId: resetPasswordUserId, password: resetNewPassword });
    }
  };

  // Filter users
  const filteredUsers = userRoles?.filter(user => {
    const matchesSearch = user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Dynamic role counts
  const roleCounts = userRoles?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Roles that have users assigned (for stats display)
  const activeRoleStats = Object.entries(roleCounts)
    .filter(([role]) => role in roleConfig)
    .sort(([a], [b]) => {
      const order = Object.keys(roleConfig);
      return order.indexOf(a) - order.indexOf(b);
    });

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as AppRole] || { label: role, icon: User, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' };
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // All roles for filter dropdown
  const allFilterRoles: AppRole[] = [
    'super_admin', 'admin', 'management', 'manager', 'sales_marketing', 'ticket_counterman',
    'gateman', 'food_manager', 'food_staff', 'booking_manager', 'accountant', 'hr_manager', 'staff'
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage all users and their roles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Add New User
              </DialogTitle>
              <DialogDescription>
                Create a new user and assign a role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {creatableRoles.map((role) => {
                      const config = roleConfig[role];
                      const Icon = config.icon;
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.label}</span>
                            <span className="text-xs text-muted-foreground ml-1">({config.description})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total users card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                {isLoading ? <Skeleton className="h-6 w-10" /> : <p className="text-xl font-bold">{userRoles?.length || 0}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        {activeRoleStats.map(([role, count]) => {
          const config = roleConfig[role as AppRole];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                    <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground truncate">{config.label}</p>
                    {isLoading ? <Skeleton className="h-6 w-10" /> : <p className="text-xl font-bold">{count}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>All users and their roles</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[180px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {allFilterRoles.map((role) => (
                    <SelectItem key={role} value={role}>{roleConfig[role].label}</SelectItem>
                  ))}
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
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setResetPasswordUserId(user.user_id);
                            setResetNewPassword('');
                          }}
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the role from this user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && removeRoleMutation.mutate(deleteConfirmId)}
            >
              {removeRoleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUserId} onOpenChange={(open) => { if (!open) { setResetPasswordUserId(null); setResetNewPassword(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>Set a new password for this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={resetPasswordUserId?.slice(0, 16) + '...'} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPasswordUserId(null); setResetNewPassword(''); }}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
