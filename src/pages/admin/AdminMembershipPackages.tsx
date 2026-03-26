import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Edit2, Save, X } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MembershipPackage>>({});

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
      setEditingId(null);
      toast.success('Package updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (pkg: MembershipPackage) => {
    setEditingId(pkg.id);
    setEditForm({ ...pkg });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
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

  const typeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membership Packages</h1>
        <p className="text-muted-foreground">Manage membership plans and pricing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((pkg) => {
          const isEditing = editingId === pkg.id;

          return (
            <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    {isEditing ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="h-8 w-40"
                      />
                    ) : (
                      pkg.name
                    )}
                  </CardTitle>
                </div>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                  {typeLabel(pkg.membership_type)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Name (Bangla)</Label>
                      <Input
                        value={editForm.name_bn || ''}
                        onChange={(e) => setEditForm({ ...editForm, name_bn: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Price (৳)</Label>
                        <Input
                          type="number"
                          value={editForm.price || 0}
                          onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Duration (days)</Label>
                        <Input
                          type="number"
                          value={editForm.duration_days || 0}
                          onChange={(e) => setEditForm({ ...editForm, duration_days: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Discount %</Label>
                        <Input
                          type="number"
                          value={editForm.discount_percent || 0}
                          onChange={(e) => setEditForm({ ...editForm, discount_percent: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
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
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">৳{pkg.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{pkg.duration_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>{pkg.discount_percent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Children</span>
                        <span>{pkg.max_children}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(pkg)}>
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={pkg.is_active ? 'secondary' : 'default'}
                        onClick={() => toggleActive(pkg)}
                      >
                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
