import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Package, Plus, Pencil, Users, Trash2, RefreshCw, Loader2, ImagePlus, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface EventPackage {
  id: string;
  name: string;
  price: number;
  max_guests: number;
  duration_hours: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
}

export default function AdminEventPackages() {
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<EventPackage | null>(null);
  const [form, setForm] = useState({ name: '', price: '', max_guests: '', duration_hours: '3', features: '', is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_packages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setPackages((data || []).map(d => ({
        ...d,
        features: Array.isArray(d.features) ? d.features as string[] : [],
      })));
    } catch (err: any) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const openCreate = () => {
    setEditingPkg(null);
    setForm({ name: '', price: '', max_guests: '', duration_hours: '3', features: '', is_active: true });
    setImageFile(null);
    setImagePreview(null);
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
    setImageFile(null);
    setImagePreview(pkg.image_url || null);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (packageId: string): Promise<string | null> => {
    if (!imageFile) return editingPkg?.image_url || null;
    
    const ext = imageFile.name.split('.').pop();
    const filePath = `${packageId}.${ext}`;
    
    const { error } = await supabase.storage
      .from('event-package-images')
      .upload(filePath, imageFile, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('event-package-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        price: Number(form.price),
        max_guests: Number(form.max_guests) || 10,
        duration_hours: Number(form.duration_hours) || 3,
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
        is_active: form.is_active,
      };

      if (editingPkg) {
        if (imageFile) {
          setUploading(true);
          payload.image_url = await uploadImage(editingPkg.id);
          setUploading(false);
        } else if (!imagePreview && editingPkg.image_url) {
          payload.image_url = null;
        }
        const { error } = await supabase.from('event_packages').update(payload).eq('id', editingPkg.id);
        if (error) throw error;
        toast.success('Package updated');
      } else {
        const maxSort = packages.length > 0 ? Math.max(...packages.map(p => p.sort_order)) : 0;
        const { data: inserted, error } = await supabase
          .from('event_packages')
          .insert({ ...payload, sort_order: maxSort + 1 })
          .select()
          .single();
        if (error) throw error;
        
        if (imageFile && inserted) {
          setUploading(true);
          const imgUrl = await uploadImage(inserted.id);
          await supabase.from('event_packages').update({ image_url: imgUrl }).eq('id', inserted.id);
          setUploading(false);
        }
        toast.success('Package created');
      }
      setDialogOpen(false);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('event_packages').delete().eq('id', id);
      if (error) throw error;
      setPackages(prev => prev.filter(p => p.id !== id));
      toast.success('Package deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('event_packages').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setPackages(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    } catch {
      toast.error('Update failed');
    }
  };

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    const oldIndex = packages.findIndex(p => p.id === draggedId);
    const newIndex = packages.findIndex(p => p.id === targetId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...packages];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setPackages(updated);

    // Persist to DB
    try {
      const updates = updated.map(p =>
        supabase.from('event_packages').update({ sort_order: p.sort_order }).eq('id', p.id)
      );
      await Promise.all(updates);
      toast.success('Sort order updated');
    } catch {
      toast.error('Sort order update failed');
      fetchPackages();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" /> Event Packages
          </h1>
          <p className="text-muted-foreground">Manage birthday & event packages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPackages} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> New Package
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Packages ({packages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="min-w-[200px]">Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No packages found. Create your first package.
                    </TableCell>
                  </TableRow>
                ) : packages.map(pkg => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      {pkg.image_url ? (
                        <img src={pkg.image_url} alt={pkg.name} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{pkg.name}</TableCell>
                    <TableCell className="font-bold text-primary">৳{pkg.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-muted-foreground" /> {pkg.max_guests}</span>
                    </TableCell>
                    <TableCell>{pkg.duration_hours}h</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">{f}</Badge>
                        ))}
                        {pkg.features.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">+{pkg.features.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={pkg.is_active} onCheckedChange={() => toggleActive(pkg.id, pkg.is_active)} />
                        <Badge variant={pkg.is_active ? 'default' : 'outline'} className="text-[10px]">
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPkg ? 'Edit Package' : 'New Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Package Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">Click to upload image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div><Label>Package Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (৳)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><Label>Max Guests</Label><Input type="number" value={form.max_guests} onChange={e => setForm(f => ({ ...f, max_guests: e.target.value }))} /></div>
            </div>
            <div><Label>Duration (hours)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} /></div>
            <div><Label>Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} placeholder={"Play area access\nThemed decoration\nCake arrangement"} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {(saving || uploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploading ? 'Uploading...' : editingPkg ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
