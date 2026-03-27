import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Package, Plus, Pencil, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EventPackage {
  id: string;
  name: string;
  price: number;
  max_guests: number;
  duration_hours: number;
  features: string[];
  is_active: boolean;
}

const defaultPackages: EventPackage[] = [
  { id: '1', name: 'Basic', price: 5000, max_guests: 10, duration_hours: 3, features: ['Play area access', 'Basic decoration'], is_active: true },
  { id: '2', name: 'Standard', price: 8000, max_guests: 20, duration_hours: 3, features: ['Play area access', 'Themed decoration', 'Cake arrangement'], is_active: true },
  { id: '3', name: 'Premium', price: 12000, max_guests: 30, duration_hours: 4, features: ['Play area access', 'Premium decoration', 'Cake & snacks', 'Photo zone'], is_active: true },
  { id: '4', name: 'Deluxe', price: 18000, max_guests: 50, duration_hours: 5, features: ['Full venue access', 'Luxury decoration', 'Full catering', 'Photo & video', 'Return gifts'], is_active: true },
];

export default function AdminEventPackages() {
  const [packages, setPackages] = useState<EventPackage[]>(defaultPackages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<EventPackage | null>(null);
  const [form, setForm] = useState({ name: '', price: '', max_guests: '', duration_hours: '', features: '', is_active: true });

  const openCreate = () => {
    setEditingPkg(null);
    setForm({ name: '', price: '', max_guests: '', duration_hours: '3', features: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (pkg: EventPackage) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      price: String(pkg.price),
      max_guests: String(pkg.max_guests),
      duration_hours: String(pkg.duration_hours),
      features: pkg.features.join('\n'),
      is_active: pkg.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price required');
      return;
    }
    const newPkg: EventPackage = {
      id: editingPkg?.id || Date.now().toString(),
      name: form.name.trim(),
      price: Number(form.price),
      max_guests: Number(form.max_guests) || 10,
      duration_hours: Number(form.duration_hours) || 3,
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      is_active: form.is_active,
    };

    if (editingPkg) {
      setPackages(prev => prev.map(p => p.id === editingPkg.id ? newPkg : p));
      toast.success('Package updated');
    } else {
      setPackages(prev => [...prev, newPkg]);
      toast.success('Package created');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    toast.success('Package deleted');
  };

  const toggleActive = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" /> Event Packages
          </h1>
          <p className="text-muted-foreground">Manage birthday & event packages</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Package
        </Button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.filter(p => p.is_active).map(pkg => (
          <Card key={pkg.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>{pkg.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <CardDescription className="text-2xl font-bold text-primary">৳{pkg.price.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> Up to {pkg.max_guests} guests
              </div>
              <div className="text-sm text-muted-foreground">
                {pkg.duration_hours} hours duration
              </div>
              <ul className="text-sm space-y-1">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(pkg)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>৳{pkg.price.toLocaleString()}</TableCell>
                  <TableCell>{pkg.max_guests}</TableCell>
                  <TableCell>{pkg.duration_hours}h</TableCell>
                  <TableCell>
                    <Switch checked={pkg.is_active} onCheckedChange={() => toggleActive(pkg.id)} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPkg ? 'Edit Package' : 'New Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Package Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (৳)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><Label>Max Guests</Label><Input type="number" value={form.max_guests} onChange={e => setForm(f => ({ ...f, max_guests: e.target.value }))} /></div>
            </div>
            <div><Label>Duration (hours)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} /></div>
            <div><Label>Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} placeholder="Play area access&#10;Themed decoration&#10;Cake arrangement" /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPkg ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
