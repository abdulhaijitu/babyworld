import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Edit, Trash2, Loader2, FerrisWheel, Baby, Users, Zap,
  Upload, X, Image as ImageIcon, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type RideCategory = 'kids' | 'family' | 'thrill';

interface Ride {
  id: string;
  name: string;
  price: number;
  category: RideCategory;
  is_active: boolean;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
  created_at: string;
}

const CATEGORY_INFO: Record<RideCategory, { label: string; icon: typeof Baby; color: string }> = {
  kids: { label: 'Kids', icon: Baby, color: 'bg-green-500/10 text-green-600 border-green-200' },
  family: { label: 'Family', icon: Users, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  thrill: { label: 'Thrill', icon: Zap, color: 'bg-orange-500/10 text-orange-600 border-orange-200' }
};

const defaultFormData = {
  name: '',
  price: 0,
  category: 'kids' as RideCategory,
  is_active: true,
  image_url: '' as string
};

export default function AdminRides() {
  const queryClient = useQueryClient();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ['admin-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Ride[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('rides').insert({
        name: data.name,
        price: data.price,
        category: data.category,
        is_active: data.is_active,
        image_url: data.image_url || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride added successfully!');
      setCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add ride');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('rides').update({
        name: data.name,
        price: data.price,
        category: data.category,
        is_active: data.is_active,
        image_url: data.image_url || null
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride updated successfully!');
      setEditOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Update failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride deleted successfully!');
      setDeleteOpen(false);
      setSelectedRide(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Delete failed');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('rides').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    }
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setSelectedRide(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('ride-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('ride-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => setFormData(prev => ({ ...prev, image_url: '' }));

  const handleEdit = (ride: Ride) => {
    setSelectedRide(ride);
    setFormData({
      name: ride.name,
      price: ride.price,
      category: ride.category,
      is_active: ride.is_active,
      image_url: ride.image_url || ''
    });
    setEditOpen(true);
  };

  const handleDelete = (ride: Ride) => {
    setSelectedRide(ride);
    setDeleteOpen(true);
  };

  // Stats
  const totalRides = rides.length;
  const activeRides = rides.filter(r => r.is_active).length;
  const kidsCount = rides.filter(r => r.category === 'kids').length;
  const familyCount = rides.filter(r => r.category === 'family').length;
  const thrillCount = rides.filter(r => r.category === 'thrill').length;

  // Filtered rides
  const filteredRides = filterCategory === 'all' 
    ? rides 
    : rides.filter(r => r.category === filterCategory);

  // Shared form renderer
  const renderRideForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ferris Wheel"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (৳)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: RideCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="thrill">Thrill</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label>Active</Label>
      </div>

      <div className="space-y-2">
        <Label>Ride Image</Label>
        {formData.image_url ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
            <Button
              type="button" variant="destructive" size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload image</span>
              </>
            )}
            <input
              type="file" accept="image/*" className="hidden"
              onChange={handleImageUpload} disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FerrisWheel className="w-6 h-6" />
            Ride Management
          </h1>
          <p className="text-muted-foreground">Manage all rides</p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ride
        </Button>
      </div>

      {/* Stats Cards - 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rides</CardDescription>
            <CardTitle className="text-2xl">{totalRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kids</CardDescription>
            <CardTitle className="text-2xl">{kidsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Family</CardDescription>
            <CardTitle className="text-2xl">{familyCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thrill</CardDescription>
            <CardTitle className="text-2xl">{thrillCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Rides Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Ride List</CardTitle>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="thrill">Thrill</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FerrisWheel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rides found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.map((ride) => {
                    const catInfo = CATEGORY_INFO[ride.category];
                    const CatIcon = catInfo.icon;
                    return (
                      <TableRow key={ride.id} className={cn(!ride.is_active && 'opacity-50')}>
                        <TableCell>
                          {ride.image_url ? (
                            <img src={ride.image_url} alt={ride.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{ride.name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", catInfo.color)}>
                            <CatIcon className="w-4 h-4" />
                            <span className="ml-1">{catInfo.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">৳{ride.price}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{ride.avg_rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-xs text-muted-foreground">({ride.review_count || 0})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={ride.is_active}
                            onCheckedChange={(checked) => 
                              toggleActiveMutation.mutate({ id: ride.id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(ride)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(ride)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ride</DialogTitle>
            <DialogDescription>Enter ride details</DialogDescription>
          </DialogHeader>
          {renderRideForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || formData.price <= 0 || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
            <DialogDescription>Update ride details</DialogDescription>
          </DialogHeader>
          {renderRideForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedRide && updateMutation.mutate({ id: selectedRide.id, data: formData })}
              disabled={!formData.name || formData.price <= 0 || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ride?</AlertDialogTitle>
            <AlertDialogDescription>
              {`"${selectedRide?.name}" will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedRide && deleteMutation.mutate(selectedRide.id)}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
