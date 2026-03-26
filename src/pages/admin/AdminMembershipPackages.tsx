import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Plus, Search, MoreHorizontal, Edit2, ToggleLeft } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface MembershipPackage {
  id: string;
  membership_type: string;
  name: string;
  name_bn: string | null;
  duration_days: number;
  price: number;
  discount_percent: number;
  max_children: number;
  features: any;
  is_active: boolean;
  sort_order: number;
}

export default function AdminMembershipPackages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MembershipPackage>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    name_bn: '',
    membership_type: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    duration_days: 30,
    price: 0,
    discount_percent: 100,
    max_children: 1,
    is_active: true,
  });

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['membership-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_packages')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as MembershipPackage[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (pkg: Partial<MembershipPackage> & { id: string }) => {
      const { id, membership_type, ...updates } = pkg;
      const { error } = await supabase
        .from('membership_packages')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] });
      setEditOpen(false);
      toast.success('Package updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('membership_packages')
        .insert({
          name: createForm.name,
          name_bn: createForm.name_bn || null,
          membership_type: createForm.membership_type,
          duration_days: createForm.duration_days,
          price: createForm.price,
          discount_percent: createForm.discount_percent,
          max_children: createForm.max_children,
          is_active: createForm.is_active,
          sort_order: packages.length,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] });
      setCreateOpen(false);
      setCreateForm({ name: '', name_bn: '', membership_type: 'monthly', duration_days: 30, price: 0, discount_percent: 100, max_children: 1, is_active: true });
      toast.success('Package created successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (pkg: MembershipPackage) => {
    setEditForm({ ...pkg });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    updateMutation.mutate({
      id: editForm.id,
      name: editForm.name,
      name_bn: editForm.name_bn,
      duration_days: editForm.duration_days,
      price: editForm.price,
      discount_percent: editForm.discount_percent,
      max_children: editForm.max_children,
      is_active: editForm.is_active,
    });
  };

  const toggleActive = (pkg: MembershipPackage) => {
    updateMutation.mutate({ id: pkg.id, is_active: !pkg.is_active });
  };

  const filtered = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Membership Packages
          </h1>
          <p className="text-sm text-muted-foreground">Manage membership plans and pricing</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Package
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14">SL</TableHead>
              <TableHead>Package Name</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Allowed Person</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No packages found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((pkg, idx) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold">{pkg.name}</span>
                      {pkg.name_bn && (
                        <span className="block text-xs text-muted-foreground">{pkg.name_bn}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{pkg.duration_days} Days</TableCell>
                  <TableCell>
                    <span className="text-sm">Guardian: 2, Kids: {pkg.max_children}</span>
                  </TableCell>
                  <TableCell className="font-semibold">৳{pkg.price.toLocaleString()}</TableCell>
                  <TableCell>{pkg.discount_percent}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={pkg.is_active ? 'default' : 'secondary'}
                      className={pkg.is_active ? 'bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/25' : ''}
                    >
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(pkg)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(pkg)}>
                          <ToggleLeft className="h-4 w-4 mr-2" />
                          {pkg.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Bangla)</Label>
              <Input
                value={editForm.name_bn || ''}
                onChange={(e) => setEditForm({ ...editForm, name_bn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (৳)</Label>
                <Input
                  type="number"
                  value={editForm.price || 0}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={editForm.duration_days || 0}
                  onChange={(e) => setEditForm({ ...editForm, duration_days: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={editForm.discount_percent || 0}
                  onChange={(e) => setEditForm({ ...editForm, discount_percent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Children</Label>
                <Input
                  type="number"
                  value={editForm.max_children || 1}
                  onChange={(e) => setEditForm({ ...editForm, max_children: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editForm.is_active ?? true}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Monthly Package"
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Bangla)</Label>
              <Input
                value={createForm.name_bn}
                onChange={(e) => setCreateForm({ ...createForm, name_bn: e.target.value })}
                placeholder="e.g. মাসিক প্যাকেজ"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={createForm.membership_type}
                onChange={(e) => setCreateForm({ ...createForm, membership_type: e.target.value as any })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (৳)</Label>
                <Input
                  type="number"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={createForm.duration_days}
                  onChange={(e) => setCreateForm({ ...createForm, duration_days: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={createForm.discount_percent}
                  onChange={(e) => setCreateForm({ ...createForm, discount_percent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Children</Label>
                <Input
                  type="number"
                  value={createForm.max_children}
                  onChange={(e) => setCreateForm({ ...createForm, max_children: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={createForm.is_active}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !createForm.name}>
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
