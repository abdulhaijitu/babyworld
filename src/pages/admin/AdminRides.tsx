import { useState, useMemo } from 'react';
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
  Plus, Edit, Trash2, Loader2, FerrisWheel,
  Upload, X, Image as ImageIcon, Search,
  ChevronLeft, ChevronRight, Activity, Ban, DollarSign, Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Ride {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
  duration_minutes: number | null;
  ride_type: string | null;
  created_at: string;
}

const defaultFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'kids' as string,
  is_active: true,
  image_url: '' as string,
  duration_hours: 0,
  ride_type: 'Paid' as string,
};

export default function AdminRides() {
  const queryClient = useQueryClient();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ['admin-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Ride[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
    const { error } = await supabase.from('rides').insert([{
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category as 'kids' | 'family' | 'thrill',
        is_active: data.is_active,
        image_url: data.image_url || null,
        duration_minutes: Math.round((data.duration_hours || 0) * 60),
        ride_type: data.ride_type || 'Paid',
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride added successfully!');
      setCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Failed to add ride'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('rides').update({
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category as 'kids' | 'family' | 'thrill',
        is_active: data.is_active,
        image_url: data.image_url || null,
        duration_minutes: Math.round((data.duration_hours || 0) * 60),
        ride_type: data.ride_type || 'Paid',
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride updated!');
      setEditOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride deleted!');
      setDeleteOpen(false);
      setSelectedRide(null);
    },
    onError: (error: any) => toast.error(error.message || 'Delete failed'),
  });

  const resetForm = () => { setFormData(defaultFormData); setSelectedRide(null); };

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
      toast.error(error.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleEdit = (ride: Ride) => {
    setSelectedRide(ride);
    setFormData({
      name: ride.name,
      description: (ride as any).description || '',
      price: ride.price,
      category: ride.category,
      is_active: ride.is_active,
      image_url: ride.image_url || '',
      duration_hours: (ride.duration_minutes || 0) / 60,
      ride_type: ride.ride_type || 'Paid',
    });
    setEditOpen(true);
  };

  const handleDelete = (ride: Ride) => { setSelectedRide(ride); setDeleteOpen(true); };

  // Stats
  const totalRides = rides.length;
  const activeRides = rides.filter(r => r.is_active).length;
  const inactiveRides = totalRides - activeRides;
  const paidRides = rides.filter(r => (r.ride_type || 'Paid') === 'Paid').length;
  const freeRides = rides.filter(r => r.ride_type === 'Free').length;

  // Filtered + paginated
  const filteredRides = useMemo(() => {
    let result = rides;
    if (filterCategory !== 'all') {
      result = result.filter(r => r.category === filterCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [rides, searchQuery, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredRides.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * entriesPerPage;
  const paginatedRides = filteredRides.slice(startIdx, startIdx + entriesPerPage);
  const showingFrom = filteredRides.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + entriesPerPage, filteredRides.length);

  // Form renderer
  const renderRideForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ferris Wheel" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (৳)</Label>
          <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} min={0} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.ride_type} onValueChange={(value) => setFormData(prev => ({ ...prev, ride_type: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))} min={0} />
        </div>
        <div className="space-y-2">
          <Label>Max Riders</Label>
          <Input type="number" value={formData.max_riders} onChange={(e) => setFormData(prev => ({ ...prev, max_riders: Number(e.target.value) }))} min={0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="thrill">Thrill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
        <Label>Active</Label>
      </div>

      <div className="space-y-2">
        <Label>Ride Image</Label>
        {formData.image_url ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : (
              <><Upload className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Upload image</span></>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><FerrisWheel className="w-3.5 h-3.5" /> Total Rides</CardDescription>
            <CardTitle className="text-2xl">{totalRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> Inactive</CardDescription>
            <CardTitle className="text-2xl text-destructive">{inactiveRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Paid</CardDescription>
            <CardTitle className="text-2xl">{paidRides}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Free</CardDescription>
            <CardTitle className="text-2xl">{freeRides}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Rides Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Ride List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls: Show entries + Category Filter + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Show</span>
                <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">entries</span>
              </div>
              <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px] h-8"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="thrill">Thrill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search rides..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 h-8" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : paginatedRides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FerrisWheel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rides found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">SL</TableHead>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Max Rider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRides.map((ride, idx) => (
                    <TableRow key={ride.id} className={cn(!ride.is_active && 'opacity-50')}>
                      <TableCell className="font-medium text-muted-foreground">{startIdx + idx + 1}</TableCell>
                      <TableCell>
                        {ride.image_url ? (
                          <img src={ride.image_url} alt={ride.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell><p className="font-medium">{ride.name}</p></TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-sm font-semibold",
                          (ride.ride_type || 'Paid') === 'Paid' ? 'text-green-600' : 'text-blue-600'
                        )}>
                          {ride.ride_type || 'Paid'}
                        </span>
                      </TableCell>
                      <TableCell><span className="font-medium">৳{ride.price}</span></TableCell>
                      <TableCell><span className="text-sm">{ride.duration_minutes || 0} min</span></TableCell>
                      <TableCell><span className="text-sm">{ride.max_riders ?? '—'}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-xs font-semibold border-0",
                          ride.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {ride.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            onClick={() => handleEdit(ride)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(ride)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredRides.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm">
              <p className="text-muted-foreground">
                Showing {showingFrom} to {showingTo} of {filteredRides.length} entries
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="h-8">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .map((p, i, arr) => (
                    <span key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                      <Button
                        variant={p === safePage ? "default" : "outline"}
                        size="sm" className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  ))
                }
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-8">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name || formData.price < 0 || createMutation.isPending}>
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
            <Button onClick={() => selectedRide && updateMutation.mutate({ id: selectedRide.id, data: formData })} disabled={!formData.name || formData.price < 0 || updateMutation.isPending}>
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
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => selectedRide && deleteMutation.mutate(selectedRide.id)}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
