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
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export default function AdminUsers() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Fetch admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserRole[];
    }
  });

  // Create admin mutation - calls edge function
  const createAdminMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password }
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(language === 'bn' ? 'অ্যাডমিন তৈরি হয়েছে' : 'Admin created successfully');
      setIsAddDialogOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
    },
    onError: (error: Error) => {
      toast.error(error.message || (language === 'bn' ? 'অ্যাডমিন তৈরি করতে সমস্যা হয়েছে' : 'Failed to create admin'));
    }
  });

  // Remove admin role mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(language === 'bn' ? 'অ্যাডমিন রোল সরানো হয়েছে' : 'Admin role removed');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error(language === 'bn' ? 'রোল সরাতে সমস্যা হয়েছে' : 'Failed to remove role');
    }
  });

  const handleCreateAdmin = () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error(language === 'bn' ? 'সব ফিল্ড পূরণ করুন' : 'Please fill all fields');
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }
    createAdminMutation.mutate({ email: newAdminEmail, password: newAdminPassword });
  };

  // Filter users based on search
  const filteredUsers = adminUsers?.filter(user => 
    user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {language === 'bn' ? 'অ্যাডমিন ইউজার পরিচালনা' : 'Manage admin users'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'নতুন অ্যাডমিন' : 'New Admin'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {language === 'bn' ? 'নতুন অ্যাডমিন যোগ করুন' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {language === 'bn' ? 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন' : 'Create a new admin account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {language === 'bn' ? 'ইমেইল' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
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
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
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
              <Button onClick={handleCreateAdmin} disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                  {language === 'bn' ? 'মোট অ্যাডমিন' : 'Total Admins'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{adminUsers?.length || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <UserCheck className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'সক্রিয় সেশন' : 'Active Sessions'}
                </p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <User className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'সাধারণ ইউজার' : 'Regular Users'}
                </p>
                <p className="text-xl font-bold">-</p>
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
              <CardTitle>{language === 'bn' ? 'অ্যাডমিন তালিকা' : 'Admin List'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'সকল অ্যাডমিন ইউজার' : 'All admin users'}
              </CardDescription>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'খুঁজুন...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
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
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-mono text-sm">{user.user_id.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
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
              <p>{language === 'bn' ? 'কোনো অ্যাডমিন পাওয়া যায়নি' : 'No admins found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'bn' ? 'অ্যাডমিন রোল সরাতে চান?' : 'Remove Admin Role?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'bn' 
                ? 'এই ইউজারের অ্যাডমিন রোল সরিয়ে দেওয়া হবে। এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।'
                : 'This will remove admin privileges from this user. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'bn' ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && removeAdminMutation.mutate(deleteConfirmId)}
            >
              {removeAdminMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'bn' ? 'সরিয়ে দিন' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
