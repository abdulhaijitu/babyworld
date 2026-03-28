import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { Plus, Search, Crown, Phone, Calendar, User, MoreVertical, CheckCircle, XCircle, Loader2, CreditCard, Banknote, TrendingUp, ChevronLeft, ChevronRight, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [phoneError, setPhoneError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundMember, setFoundMember] = useState<Membership | null>(null);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    member_name: '',
    phone: '',
    child_count: 1,
    guardian_count: 1,
    selected_package_id: '',
    notes: '',
    payment_type: 'cash' as 'cash' | 'online' | 'pending',
    payment_amount: 0,
    valid_from: format(new Date(), 'yyyy-MM-dd'),
  });

  // Debounced phone lookup for existing members
  useEffect(() => {
    const phone = formData.phone.replace(/\s/g, '');
    const regex = /^(\+?880|0)?1[3-9]\d{8}$/;

    if (!regex.test(phone)) {
      setFoundMember(null);
      return;
    }

    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    lookupTimerRef.current = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const { data } = await supabase
          .from('memberships')
          .select('*')
          .eq('phone', phone)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const member = data[0] as unknown as Membership;
          setFoundMember(member);
          setFormData(prev => ({
            ...prev,
            member_name: member.member_name,
            child_count: member.child_count,
            notes: member.notes || '',
          }));
        } else {
          setFoundMember(null);
        }
      } catch {
        setFoundMember(null);
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
  }, [formData.phone]);

  

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    const regex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (!cleaned) { setPhoneError(''); return false; }
    if (!regex.test(cleaned)) { setPhoneError('Enter a valid Bangladesh phone number (01XXXXXXXXX)'); return false; }
    setPhoneError('');
    return true;
  };

  const { data: packages = [] } = useQuery({
    queryKey: ['membership-packages-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
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

  // Fetch visit counts per membership
  const { data: visitCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['membership-visit-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_visits')
        .select('membership_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((v: any) => {
        counts[v.membership_id] = (counts[v.membership_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: paymentLogs = [] } = useQuery({
    queryKey: ['membership-payment-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'membership_payment')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch visit history for selected member
  const { data: memberVisits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['member-visits', selectedMember?.id],
    queryFn: async () => {
      if (!selectedMember) return [];
      const { data, error } = await supabase
        .from('membership_visits')
        .select('*')
        .eq('membership_id', selectedMember.id)
        .order('check_in_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedMember,
  });

  // Get payment log for selected member
  const selectedMemberPayment = selectedMember
    ? paymentLogs.find(l => (l.details as any)?.membership_id === selectedMember.id)
    : null;

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
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Update failed');
    },
  });

  const selectedPackage = packages.find((p: any) => p.id === formData.selected_package_id);

  const handleCreate = async () => {
    if (!formData.member_name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error('Enter a valid phone number');
      return;
    }
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-membership?action=create', {
        body: {
          member_name: formData.member_name,
          phone: formData.phone,
          child_count: formData.child_count,
          membership_type: selectedPackage.membership_type,
          discount_percent: selectedPackage.discount_percent,
          notes: formData.notes,
          payment_type: formData.payment_type,
          payment_amount: formData.payment_amount,
          valid_from: formData.valid_from,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Membership created');
      setIsCreateOpen(false);
      setFormData({
        member_name: '',
        phone: '',
        child_count: 1,
        guardian_count: 1,
        selected_package_id: '',
        notes: '',
        payment_type: 'cash',
        payment_amount: 0,
        valid_from: format(new Date(), 'yyyy-MM-dd'),
      });
      setPhoneError('');
      setFoundMember(null);
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    } catch (error: any) {
      toast.error(error.message || ('Creation failed'));
    } finally {
      setIsCreating(false);
    }
  };

  const filteredMemberships = memberships?.filter(m => {
    const matchesSearch = 
      m.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || m.membership_type === packageFilter;
    // Payment filter: check from paymentLogs
    const matchesPayment = paymentFilter === 'all' || (() => {
      const log = paymentLogs.find(l => (l.details as any)?.membership_id === m.id);
      const pt = (log?.details as any)?.payment_type || 'unknown';
      return pt === paymentFilter;
    })();
    return matchesSearch && matchesStatus && matchesPackage && matchesPayment;
  }) || [];

  const paymentStats = {
    totalCollected: paymentLogs.reduce((sum, log) => {
      const details = log.details as any;
      if (details?.payment_type !== 'pending') return sum + (details?.payment_amount || 0);
      return sum;
    }, 0),
    pendingAmount: paymentLogs.reduce((sum, log) => {
      const details = log.details as any;
      if (details?.payment_type === 'pending') return sum + (details?.payment_amount || 0);
      return sum;
    }, 0),
    cashTotal: paymentLogs.reduce((sum, log) => {
      const details = log.details as any;
      if (details?.payment_type === 'cash') return sum + (details?.payment_amount || 0);
      return sum;
    }, 0),
    onlineTotal: paymentLogs.reduce((sum, log) => {
      const details = log.details as any;
      if (details?.payment_type === 'online') return sum + (details?.payment_amount || 0);
      return sum;
    }, 0),
  };

  const stats = {
    total: memberships?.length || 0,
    active: memberships?.filter(m => m.status === 'active').length || 0,
    expired: memberships?.filter(m => m.status === 'expired').length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">{'Active'}</Badge>;
      case 'expired':
        return <Badge variant="secondary">{'Expired'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{'Cancelled'}</Badge>;
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
    return labels[type as keyof typeof labels]?.['en'] || type;
  };

  const getRemainingDays = (validTill: string) => {
    const days = differenceInDays(new Date(validTill), new Date());
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {'New Member'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{'Create New Membership'}</DialogTitle>
              <DialogDescription>
                {'Fill in member details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{'Member Name *'}</Label>
                <Input
                  placeholder={'Enter name'}
                  value={formData.member_name}
                  onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{'Phone Number *'}</Label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (e.target.value) validatePhone(e.target.value);
                  }}
                />
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                {lookupLoading && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Searching...
                  </p>
                )}
                {foundMember && !lookupLoading && (
                  <p className="text-xs text-primary flex items-center gap-1 bg-primary/10 rounded px-2 py-1">
                    🔄 Existing member: <span className="font-semibold">{foundMember.member_name}</span> — info auto-filled
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{'Plan *'}</Label>
                <Select
                  value={formData.selected_package_id}
                  onValueChange={(value: string) => {
                    const pkg = packages.find((p: any) => p.id === value);
                    setFormData({
                      ...formData,
                      selected_package_id: value,
                      child_count: pkg ? pkg.max_children : formData.child_count,
                      guardian_count: pkg ? (pkg as any).max_guardians : formData.guardian_count,
                      payment_amount: pkg ? pkg.price : 0,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg: any) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} — ৳{pkg.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPackage && (
                  <div className="text-xs text-muted-foreground rounded border p-2 bg-muted/30">
                    Duration: {selectedPackage.duration_days} days | 
                    Max Guardian: {(selectedPackage as any).max_guardians} | 
                    Max Kids: {selectedPackage.max_children} | 
                    Discount: {selectedPackage.discount_percent}%
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{'Child Count'}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedPackage?.max_children || 10}
                    value={formData.child_count}
                    onChange={(e) => setFormData({ ...formData, child_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{'Guardian Count'}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={(selectedPackage as any)?.max_guardians || 5}
                    value={formData.guardian_count}
                    onChange={(e) => setFormData({ ...formData, guardian_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{'Valid From'}</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              {/* Payment Section */}
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Amount (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.payment_amount}
                      onChange={(e) => setFormData({ ...formData, payment_amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={formData.payment_type}
                      onValueChange={(value: 'cash' | 'online' | 'pending') => setFormData({ ...formData, payment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <span className="flex items-center gap-2"><Banknote className="h-3.5 w-3.5" /> Cash</span>
                        </SelectItem>
                        <SelectItem value="online">
                          <span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Online</span>
                        </SelectItem>
                        <SelectItem value="pending">
                          <span className="flex items-center gap-2">⏳ Pending</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.payment_amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Payment of <span className="font-semibold text-foreground">৳{formData.payment_amount.toLocaleString()}</span> will be recorded as <span className="font-semibold text-foreground capitalize">{formData.payment_type}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{'Notes'}</Label>
                <Textarea
                  placeholder={'Additional notes...'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {'Create Membership'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold text-primary">{stats.active}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold text-muted-foreground">{stats.expired}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold text-primary">৳{paymentStats.totalCollected.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold">৳{paymentStats.cashTotal.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-0.5"><Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Cash</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold">৳{paymentStats.onlineTotal.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-0.5"><CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-1.5 sm:p-2 text-center">
            <p className="text-base sm:text-lg font-bold text-destructive">৳{paymentStats.pendingAmount.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={'Search by name or phone...'}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder={'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{'All Status'}</SelectItem>
                  <SelectItem value="active">{'Active'}</SelectItem>
                  <SelectItem value="expired">{'Expired'}</SelectItem>
                  <SelectItem value="cancelled">{'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder={'Package'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{'All Package'}</SelectItem>
                  <SelectItem value="monthly">{'Monthly'}</SelectItem>
                  <SelectItem value="quarterly">{'Quarterly'}</SelectItem>
                  <SelectItem value="yearly">{'Yearly'}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder={'Payment'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{'All Payment'}</SelectItem>
                  <SelectItem value="cash">{'Cash'}</SelectItem>
                  <SelectItem value="online">{'Online'}</SelectItem>
                  <SelectItem value="pending">{'Pending'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <p>{'No memberships found'}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2 p-3">
                {(() => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedItems = filteredMemberships.slice(startIndex, startIndex + itemsPerPage);
                  return paginatedItems.map((membership) => {
                    const remainingDays = getRemainingDays(membership.valid_till);
                    return (
                      <div key={membership.id} className="rounded-lg border bg-card p-3 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{membership.member_name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {getStatusBadge(membership.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {membership.status === 'active' && (
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: membership.id, status: 'cancelled' })}>
                                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                                  </DropdownMenuItem>
                                )}
                                {membership.status !== 'active' && (
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: membership.id, status: 'active' })}>
                                    <CheckCircle className="h-4 w-4 mr-2" /> Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{membership.phone}</span>
                          <span>·</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getTypeBadge(membership.membership_type)}</Badge>
                          <span>·</span>
                          <span>{visitCounts[membership.id] || 0} visits</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{membership.valid_from} → {membership.valid_till}</span>
                          {membership.status === 'active' && (
                            <span className={`font-medium ${remainingDays <= 7 ? 'text-orange-600' : ''}`}>
                              {remainingDays}d left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Member'}</TableHead>
                      <TableHead>{'Plan'}</TableHead>
                      <TableHead>{'Validity'}</TableHead>
                      <TableHead>{'Status'}</TableHead>
                      <TableHead>{'Visits'}</TableHead>
                      <TableHead>{'Discount'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedItems = filteredMemberships.slice(startIndex, startIndex + itemsPerPage);
                      return paginatedItems.map((membership) => {
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
                                {membership.child_count} {'child(ren)'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{membership.valid_from} - {membership.valid_till}</p>
                                {membership.status === 'active' && (
                                  <p className={`text-xs ${remainingDays <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                    {remainingDays} {'days left'}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(membership.status)}</TableCell>
                            <TableCell>
                              <span className="font-medium">{visitCounts[membership.id] || 0}</span>
                            </TableCell>
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
                                      {'Cancel'}
                                    </DropdownMenuItem>
                                  )}
                                  {membership.status !== 'active' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateStatusMutation.mutate({ id: membership.id, status: 'active' })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {'Activate'}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          {/* Pagination */}
          {filteredMemberships.length > itemsPerPage && (
            <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t">
              <p className="hidden sm:block text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredMemberships.length)} of {filteredMemberships.length}
              </p>
              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} / {Math.ceil(filteredMemberships.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= Math.ceil(filteredMemberships.length / itemsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
