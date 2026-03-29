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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  offer_price: number;
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
  offer_price: 0,
  category: 'kids' as string,
  is_active: true,
  image_url: '' as string,
  duration_minutes: 0,
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
        offer_price: data.offer_price,
        category: data.category as 'kids' | 'family' | 'thrill',
        is_active: data.is_active,
        image_url: data.image_url || null,
        duration_minutes: data.duration_minutes || 0,
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
        offer_price: data.offer_price,
        category: data.category as 'kids' | 'family' | 'thrill',
        is_active: data.is_active,
        image_url: data.image_url || null,
        duration_minutes: data.duration_minutes || 0,
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
      offer_price: ride.offer_price || 0,
      category: ride.category,
      is_active: ride.is_active,
      image_url: ride.image_url || '',
      duration_minutes: ride.duration_minutes || 0,
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
    <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
      {/* Basic Info */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</p>
        <div className="space-y-2">
          <Label>Name <span className="text-destructive">*</span></Label>
          <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ferris Wheel" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Write a short description about this ride..."
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* Pricing & Type */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing & Type</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Regular Price (৳)</Label>
            <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} min={0} />
          </div>
          <div className="space-y-2">
            <Label>Offer Price (৳)</Label>
            <Input type="number" value={formData.offer_price} onChange={(e) => setFormData(prev => ({ ...prev, offer_price: Number(e.target.value) }))} min={0} placeholder="0 = no offer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))} min={0} step={1} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <div className="grid grid-cols-2 gap-3 items-end">
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
          <div className="flex items-center gap-2 pb-1">
            <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
            <Label>Active</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Image */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</p>
        {formData.image_url ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border">
            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground/70 mt-1">Max 2MB</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ride
        </Button>
      </div>

      {/* Stats Cards — always 5 cols */}
      <div className="grid grid-cols-5 gap-2 lg:gap-4">
        {[
          { icon: FerrisWheel, label: 'Total', value: totalRides, color: '' },
          { icon: Activity, label: 'Active', value: activeRides, color: 'text-green-600' },
          { icon: Ban, label: 'Inactive', value: inactiveRides, color: 'text-destructive' },
          { icon: DollarSign, label: 'Paid', value: paidRides, color: '' },
          { icon: Gift, label: 'Free', value: freeRides, color: '' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardHeader className="p-2 pb-1 lg:p-4 lg:pb-2">
              <CardDescription className="flex items-center gap-1 text-[10px] lg:text-xs"><Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.slice(0,3)}</span></CardDescription>
              <CardTitle className={cn("text-lg lg:text-2xl", color)}>{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Rides Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Ride List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls: compact single row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground hidden lg:inline">Show</span>
              <Select value={String(entriesPerPage)} onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[60px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground hidden lg:inline">entries</span>
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[90px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="thrill">Thrill</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 h-8" />
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
            <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-2">
              {paginatedRides.map((ride, idx) => (
                <div key={ride.id} className={cn("flex items-center gap-3 p-2.5 rounded-lg border bg-card", !ride.is_active && 'opacity-50')}>
                  {ride.image_url ? (
                    <img src={ride.image_url} alt={ride.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ride.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className={cn("font-semibold", (ride.ride_type || 'Paid') === 'Paid' ? 'text-green-600' : 'text-blue-600')}>
                        {ride.ride_type || 'Paid'}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-medium">৳{ride.price}</span>
                      {ride.offer_price > 0 && <span className="font-medium text-orange-600">৳{ride.offer_price}</span>}
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 border-0",
                        ride.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {ride.is_active ? 'Active' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => handleEdit(ride)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ride)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">SL</TableHead>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Regular Price</TableHead>
                    <TableHead>Offer Price</TableHead>
                    <TableHead>Duration</TableHead>
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
                        <span className={cn("text-sm font-semibold", (ride.ride_type || 'Paid') === 'Paid' ? 'text-green-600' : 'text-blue-600')}>
                          {ride.ride_type || 'Paid'}
                        </span>
                      </TableCell>
                      <TableCell><span className="font-medium">৳{ride.price}</span></TableCell>
                      <TableCell><span className="font-medium text-orange-600">{ride.offer_price ? `৳${ride.offer_price}` : '—'}</span></TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{ride.duration_minutes ? `${ride.duration_minutes} min` : '—'}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-xs font-semibold border-0",
                          ride.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {ride.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20" onClick={() => handleEdit(ride)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(ride)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </>
          )}

          {/* Pagination */}
          {filteredRides.length > 0 && (
            <div className="flex items-center justify-between gap-2 mt-4 text-xs lg:text-sm">
              <p className="text-muted-foreground">
                {showingFrom}-{showingTo} / {filteredRides.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="h-8 px-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden lg:inline">Previous</span>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .map((p, i, arr) => (
                    <span key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                      <Button variant={p === safePage ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p)}>
                        {p}
                      </Button>
                    </span>
                  ))
                }
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-8 px-2">
                  <span className="hidden lg:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Ride</DialogTitle>
            <DialogDescription>Fill in the details to add a new ride</DialogDescription>
          </DialogHeader>
          {renderRideForm()}
          <DialogFooter className="pt-2 border-t">
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
            <DialogDescription>Update the ride details below</DialogDescription>
          </DialogHeader>
          {renderRideForm()}
          <DialogFooter className="pt-2 border-t">
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
              <span className="font-semibold text-foreground">"{selectedRide?.name}"</span> will be permanently deleted. This action cannot be undone.
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
