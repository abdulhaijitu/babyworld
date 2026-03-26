import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Plus, Search, MoreHorizontal, Edit2, ToggleLeft, Trash2, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
  max_guardians: number;
  features: any;
  is_active: boolean;
  sort_order: number;
}

interface PackageFormState {
  name: string;
  duration_days: number;
  price: number;
  max_children: number;
  max_guardians: number;
  is_active: boolean;
  duration_minutes: number;
  entrance_method: string;
  allowed_visits: number;
  benefit_title: string;
  benefit_description: string;
}

const defaultForm: PackageFormState = {
  name: '',
  duration_days: 30,
  price: 0,
  max_children: 1,
  max_guardians: 2,
  is_active: true,
  duration_minutes: 60,
  entrance_method: 'QR Code',
  allowed_visits: 1,
  benefit_title: '',
  benefit_description: '',
};

function PackageFormFields({ form, setForm }: { form: PackageFormState; setForm: (f: PackageFormState) => void }) {
  return (
    <div className="px-6 space-y-6 pb-2">
      {/* Section: PACKAGE INFORMATION */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Package Information</span>
        </div>
        <Separator className="mb-4" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Package Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Monthly Package"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Price *</Label>
            <div className="relative">
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">BDT</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Validity</Label>
            <div className="relative">
              <Input
                type="number"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">Days</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
            <div className="relative">
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">Minutes</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Allowed Person (Guardian)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.max_guardians}
              onChange={(e) => setForm({ ...form, max_guardians: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} Guardian{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Allowed Person (Kids)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.max_children}
              onChange={(e) => setForm({ ...form, max_children: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} Kid{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Entrance Method</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.entrance_method}
              onChange={(e) => setForm({ ...form, entrance_method: e.target.value })}
            >
              <option value="QR Code">QR Code</option>
              <option value="Manual">Manual</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Allowed Visit</Label>
            <div className="relative">
              <Input
                type="number"
                value={form.allowed_visits}
                onChange={(e) => setForm({ ...form, allowed_visits: Number(e.target.value) })}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">Times</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-end pb-1 gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <Label className="text-sm">Active</Label>
          </div>
        </div>
      </div>

      {/* Section: PACKAGE BENEFITS */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Package Benefits</span>
        </div>
        <Separator className="mb-4" />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Benefit Title</Label>
            <Input
              value={form.benefit_title}
              onChange={(e) => setForm({ ...form, benefit_title: e.target.value })}
              placeholder="e.g. Unlimited Play Access"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Description</Label>
            <Textarea
              value={form.benefit_description}
              onChange={(e) => setForm({ ...form, benefit_description: e.target.value })}
              placeholder="Describe the benefits of this package..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminMembershipPackages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PackageFormState>({ ...defaultForm });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PackageFormState>({ ...defaultForm });

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

  const buildFeatures = (form: PackageFormState) => ({
    duration_minutes: form.duration_minutes,
    entrance_method: form.entrance_method,
    allowed_visits: form.allowed_visits,
    benefit_title: form.benefit_title,
    benefit_description: form.benefit_description,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: PackageFormState }) => {
      const { error } = await supabase
        .from('membership_packages')
        .update({
          name: form.name,
          duration_days: form.duration_days,
          price: form.price,
          max_children: form.max_children,
          max_guardians: form.max_guardians,
          is_active: form.is_active,
          features: buildFeatures(form),
        } as any)
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('membership_packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('membership_packages')
        .insert({
          name: createForm.name,
          name_bn: null,
          membership_type: 'monthly',
          duration_days: createForm.duration_days,
          price: createForm.price,
          discount_percent: 100,
          max_children: createForm.max_children,
          max_guardians: createForm.max_guardians,
          sort_order: packages.length,
          features: buildFeatures(createForm),
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] });
      setCreateOpen(false);
      setCreateForm({ ...defaultForm });
      toast.success('Package created successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (pkg: MembershipPackage) => {
    const features = (pkg.features as any) || {};
    setEditId(pkg.id);
    setEditForm({
      name: pkg.name,
      duration_days: pkg.duration_days,
      price: pkg.price,
      max_children: pkg.max_children,
      max_guardians: pkg.max_guardians ?? 2,
      is_active: pkg.is_active,
      duration_minutes: features.duration_minutes || 60,
      entrance_method: features.entrance_method || 'QR Code',
      allowed_visits: features.allowed_visits || 1,
      benefit_title: features.benefit_title || '',
      benefit_description: features.benefit_description || '',
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editId) return;
    updateMutation.mutate({ id: editId, form: editForm });
  };

  const toggleActive = (pkg: MembershipPackage) => {
    const features = (pkg.features as any) || {};
    updateMutation.mutate({
      id: pkg.id,
      form: {
        name: pkg.name,
        duration_days: pkg.duration_days,
        price: pkg.price,
        max_children: pkg.max_children,
        max_guardians: pkg.max_guardians ?? 2,
        is_active: !pkg.is_active,
        duration_minutes: features.duration_minutes || 60,
        entrance_method: features.entrance_method || 'QR Code',
        allowed_visits: features.allowed_visits || 1,
        benefit_title: features.benefit_title || '',
        benefit_description: features.benefit_description || '',
      },
    });
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
                    <span className="text-sm">Guardian: {(pkg as any).max_guardians ?? 2}, Kids: {pkg.max_children}</span>
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
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this package?')) {
                              deleteMutation.mutate(pkg.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-primary" />
              Edit Package
            </DialogTitle>
          </DialogHeader>

          <PackageFormFields form={editForm} setForm={setEditForm} />

          <div className="px-6 pb-6 pt-2">
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => setEditOpen(false)}>
                Discard
              </Button>
              <Button className="w-full" onClick={saveEdit} disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-primary" />
              Create New Package
            </DialogTitle>
          </DialogHeader>

          <PackageFormFields form={createForm} setForm={setCreateForm} />

          <div className="px-6 pb-6 pt-2">
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => setCreateOpen(false)}>
                Discard
              </Button>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !createForm.name}>
                Save Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
