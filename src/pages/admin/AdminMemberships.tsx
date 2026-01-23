import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Plus, Search, Crown, Phone, Calendar, User, MoreVertical, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Membership {
  id: string;
  member_name: string;
  phone: string;
  child_count: number;
  membership_type: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  valid_from: string;
  valid_till: string;
  discount_percent: number;
  notes: string | null;
  created_at: string;
}

export default function AdminMemberships() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    member_name: '',
    phone: '',
    child_count: 1,
    membership_type: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    discount_percent: 100,
    notes: '',
  });

  const { data: memberships, isLoading } = useQuery<Membership[]>({
    queryKey: ['memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Membership[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-membership?action=update-status', {
        body: { membership_id: id, status },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    },
    onError: () => {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    },
  });

  const handleCreate = async () => {
    if (!formData.member_name || !formData.phone) {
      toast.error(language === 'bn' ? 'নাম ও ফোন প্রয়োজন' : 'Name and phone are required');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-membership?action=create', {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(language === 'bn' ? 'মেম্বারশিপ তৈরি হয়েছে' : 'Membership created');
      setIsCreateOpen(false);
      setFormData({
        member_name: '',
        phone: '',
        child_count: 1,
        membership_type: 'monthly',
        discount_percent: 100,
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    } catch (error: any) {
      toast.error(error.message || (language === 'bn' ? 'তৈরি ব্যর্থ' : 'Creation failed'));
    } finally {
      setIsCreating(false);
    }
  };

  const filteredMemberships = memberships?.filter(m => {
    const matchesSearch = 
      m.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: memberships?.length || 0,
    active: memberships?.filter(m => m.status === 'active').length || 0,
    expired: memberships?.filter(m => m.status === 'expired').length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">{language === 'bn' ? 'সক্রিয়' : 'Active'}</Badge>;
      case 'expired':
        return <Badge variant="secondary">{language === 'bn' ? 'মেয়াদ শেষ' : 'Expired'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      monthly: { en: 'Monthly', bn: 'মাসিক' },
      quarterly: { en: 'Quarterly', bn: 'ত্রৈমাসিক' },
      yearly: { en: 'Yearly', bn: 'বার্ষিক' },
    };
    return labels[type as keyof typeof labels]?.[language === 'bn' ? 'bn' : 'en'] || type;
  };

  const getRemainingDays = (validTill: string) => {
    const days = differenceInDays(new Date(validTill), new Date());
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            {language === 'bn' ? 'মেম্বারশিপ ব্যবস্থাপনা' : 'Membership Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সদস্যদের তথ্য পরিচালনা করুন' : 'Manage member subscriptions'}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'নতুন মেম্বার' : 'New Member'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'bn' ? 'নতুন মেম্বারশিপ তৈরি' : 'Create New Membership'}</DialogTitle>
              <DialogDescription>
                {language === 'bn' ? 'সদস্যের তথ্য পূরণ করুন' : 'Fill in member details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'সদস্যের নাম *' : 'Member Name *'}</Label>
                <Input
                  placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
                  value={formData.member_name}
                  onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}</Label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'শিশু সংখ্যা' : 'Child Count'}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.child_count}
                    onChange={(e) => setFormData({ ...formData, child_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'ছাড় (%)' : 'Discount (%)'}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'প্ল্যান' : 'Plan'}</Label>
                <Select
                  value={formData.membership_type}
                  onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => 
                    setFormData({ ...formData, membership_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{language === 'bn' ? 'মাসিক' : 'Monthly'}</SelectItem>
                    <SelectItem value="quarterly">{language === 'bn' ? 'ত্রৈমাসিক' : 'Quarterly'}</SelectItem>
                    <SelectItem value="yearly">{language === 'bn' ? 'বার্ষিক' : 'Yearly'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                <Textarea
                  placeholder={language === 'bn' ? 'অতিরিক্ত তথ্য...' : 'Additional notes...'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {language === 'bn' ? 'মেম্বারশিপ তৈরি করুন' : 'Create Membership'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{language === 'bn' ? 'মোট সদস্য' : 'Total Members'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">{language === 'bn' ? 'সক্রিয়' : 'Active'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{stats.expired}</p>
            <p className="text-sm text-muted-foreground">{language === 'bn' ? 'মেয়াদ শেষ' : 'Expired'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'নাম বা ফোন দিয়ে খুঁজুন...' : 'Search by name or phone...'}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                <SelectItem value="active">{language === 'bn' ? 'সক্রিয়' : 'Active'}</SelectItem>
                <SelectItem value="expired">{language === 'bn' ? 'মেয়াদ শেষ' : 'Expired'}</SelectItem>
                <SelectItem value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Memberships Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'bn' ? 'কোনো মেম্বারশিপ পাওয়া যায়নি' : 'No memberships found'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'সদস্য' : 'Member'}</TableHead>
                  <TableHead>{language === 'bn' ? 'প্ল্যান' : 'Plan'}</TableHead>
                  <TableHead>{language === 'bn' ? 'মেয়াদ' : 'Validity'}</TableHead>
                  <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                  <TableHead>{language === 'bn' ? 'ছাড়' : 'Discount'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => {
                  const remainingDays = getRemainingDays(membership.valid_till);
                  return (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{membership.member_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {membership.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeBadge(membership.membership_type)}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {membership.child_count} {language === 'bn' ? 'শিশু' : 'child(ren)'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{membership.valid_from} - {membership.valid_till}</p>
                          {membership.status === 'active' && (
                            <p className={`text-xs ${remainingDays <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                              {remainingDays} {language === 'bn' ? 'দিন বাকি' : 'days left'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(membership.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{membership.discount_percent}%</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {membership.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: membership.id, status: 'cancelled' })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                              </DropdownMenuItem>
                            )}
                            {membership.status !== 'active' && (
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: membership.id, status: 'active' })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {language === 'bn' ? 'সক্রিয় করুন' : 'Activate'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
