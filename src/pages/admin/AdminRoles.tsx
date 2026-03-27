import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Users, Save, Loader2 } from 'lucide-react';

interface RolePermission {
  id?: string;
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const ROLES = [
  { value: 'management', label: 'Management', description: 'সব মডিউলে ফুল অ্যাক্সেস (ডিলিট ছাড়া)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'manager', label: 'Manager', description: 'HR, Accounts, Reports, Marketing অ্যাক্সেস', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'sales_marketing', label: 'Sales & Marketing', description: 'Leads, Promotions, SMS, Social Media', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'ticket_counterman', label: 'Ticket Counterman', description: 'টিকেট তৈরি, টিকেট লিস্ট', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'gateman', label: 'Gateman', description: 'গেট লগ এন্ট্রি, টিকেট স্ক্যান', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'food_manager', label: 'Food Manager', description: 'Food POS, Orders, Items, Coupons', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'food_staff', label: 'Food Staff', description: 'Food POS ও Orders', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { value: 'booking_manager', label: 'Booking Manager', description: 'ইভেন্ট বুকিং, ক্যালেন্ডার, প্যাকেজ', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { value: 'accountant', label: 'Accountant', description: 'Income, Expenses, Daily Cash, Profit', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Employees, Attendance, Payroll, Leave', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
];

const MODULES = [
  { value: 'ticketing', label: 'Ticketing' },
  { value: 'membership', label: 'Membership' },
  { value: 'foods', label: 'Foods' },
  { value: 'events', label: 'Events' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'settings', label: 'Settings' },
  { value: 'notifications', label: 'Notifications' },
];

export default function AdminRoles() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('management');
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPermissions();
    fetchUserCounts();
  }, []);

  const fetchPermissions = async () => {
    const { data, error } = await supabase.from('role_permissions').select('*');
    if (error) {
      toast({ title: 'Error', description: 'পারমিশন লোড করতে সমস্যা হয়েছে', variant: 'destructive' });
    } else {
      setPermissions(data || []);
    }
    setLoading(false);
  };

  const fetchUserCounts = async () => {
    const { data, error } = await supabase.from('user_roles').select('role');
    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((r: any) => {
        counts[r.role] = (counts[r.role] || 0) + 1;
      });
      setUserCounts(counts);
    }
  };

  const getPermission = (role: string, module: string): RolePermission => {
    return permissions.find(p => p.role === role && p.module === module) || {
      role, module, can_view: false, can_create: false, can_edit: false, can_delete: false
    };
  };

  const togglePermission = (role: string, module: string, field: keyof Pick<RolePermission, 'can_view' | 'can_create' | 'can_edit' | 'can_delete'>) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role === role && p.module === module);
      if (existing) {
        return prev.map(p => p.role === role && p.module === module ? { ...p, [field]: !p[field] } : p);
      }
      return [...prev, { role, module, can_view: false, can_create: false, can_edit: false, can_delete: false, [field]: true }];
    });
  };

  const savePermissions = async () => {
    setSaving(true);
    const rolePerms = permissions.filter(p => p.role === selectedRole);
    
    for (const perm of rolePerms) {
      const { id, ...data } = perm;
      if (id) {
        await supabase.from('role_permissions').update({
          can_view: data.can_view,
          can_create: data.can_create,
          can_edit: data.can_edit,
          can_delete: data.can_delete,
        }).eq('id', id);
      } else {
        await supabase.from('role_permissions').upsert(data, { onConflict: 'role,module' });
      }
    }

    toast({ title: 'সফল!', description: `${selectedRole} রোলের পারমিশন সেভ হয়েছে` });
    setSaving(false);
    fetchPermissions();
  };

  const selectedRoleInfo = ROLES.find(r => r.value === selectedRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Role Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {ROLES.map(role => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRole === role.value ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => setSelectedRole(role.value)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${role.color}`}>
                  {role.label}
                </Badge>
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="text-[10px]">{userCounts[role.value] || 0}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      {selectedRoleInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={selectedRoleInfo.color}>{selectedRoleInfo.label}</Badge>
                  Permission Matrix
                </CardTitle>
                <CardDescription className="mt-1">{selectedRoleInfo.description}</CardDescription>
              </div>
              <Button onClick={savePermissions} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Module</TableHead>
                    <TableHead className="text-center w-[100px]">View</TableHead>
                    <TableHead className="text-center w-[100px]">Create</TableHead>
                    <TableHead className="text-center w-[100px]">Edit</TableHead>
                    <TableHead className="text-center w-[100px]">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map(mod => {
                    const perm = getPermission(selectedRole, mod.value);
                    return (
                      <TableRow key={mod.value}>
                        <TableCell className="font-medium">{mod.label}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.can_view}
                            onCheckedChange={() => togglePermission(selectedRole, mod.value, 'can_view')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.can_create}
                            onCheckedChange={() => togglePermission(selectedRole, mod.value, 'can_create')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.can_edit}
                            onCheckedChange={() => togglePermission(selectedRole, mod.value, 'can_edit')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={perm.can_delete}
                            onCheckedChange={() => togglePermission(selectedRole, mod.value, 'can_delete')}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
