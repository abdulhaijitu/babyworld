import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Minus, Ticket, Loader2, CheckCircle, Crown, Search, Footprints, UserCheck, History, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  guardian_name: z.string().optional(),
  phone: z.string().min(11, 'Phone number must be at least 11 digits').regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid phone'),
  notes: z.string().optional(),
  payment_type: z.enum(['cash', 'online']),
});

type FormValues = z.infer<typeof formSchema>;
type RideCategory = 'kids' | 'family' | 'thrill';

interface Ride {
  id: string;
  name: string;
  name_bn: string | null;
  price: number;
  is_active: boolean;
  category: RideCategory;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
}

const CATEGORY_COLORS: Record<RideCategory, string> = {
  kids: 'bg-green-500',
  family: 'bg-blue-500',
  thrill: 'bg-orange-500',
};

interface MembershipInfo {
  id: string;
  member_name: string;
  discount_percent: number;
  valid_till: string;
}

interface VisitRecord {
  id: string;
  ticket_number: string;
  slot_date: string;
  total_price: number | null;
  child_count: number | null;
  guardian_count: number | null;
  status: string;
  created_at: string;
}

interface CounterTicketFormProps {
  onSuccess?: (ticket: any) => void;
}

export function CounterTicketForm({ onSuccess }: CounterTicketFormProps) {
  const [guardianCount, setGuardianCount] = useState(1);
  const [childCount, setChildCount] = useState(1);
  const [socksCount, setSocksCount] = useState(1);
  const [selectedRides, setSelectedRides] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [rideSearch, setRideSearch] = useState('');
  const [discount, setDiscount] = useState(0);

  const [previousCustomer, setPreviousCustomer] = useState(false);
  const [visitHistory, setVisitHistory] = useState<VisitRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [visitDetail, setVisitDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Generate sequential entry number
  const [entryNo, setEntryNo] = useState('');
  const generateEntryNo = useCallback(async () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `${yy}${mm}${dd}`;
    const today = format(now, 'yyyy-MM-dd');
    try {
      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('slot_date', today);
      const seq = String((count || 0) + 1).padStart(3, '0');
      setEntryNo(`${prefix}-${seq}`);
    } catch {
      setEntryNo(`${prefix}-001`);
    }
  }, []);

  useEffect(() => {
    generateEntryNo();
  }, [generateEntryNo]);

  const { data: rides = [] } = useQuery<Ride[]>({
    queryKey: ['rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: ticketPricing } = useQuery({
    queryKey: ['ticket-pricing-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ticket_pricing')
        .single();
      return data?.value as { entry_price: number; extra_guardian_price: number; extra_child_price: number; socks_price: number } | null;
    },
  });

  const pricing = ticketPricing || {
    entry_price: 500,
    extra_guardian_price: 100,
    extra_child_price: 200,
    socks_price: 50,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guardian_name: '',
      phone: '',
      notes: '',
      payment_type: 'cash',
    },
  });

  const phone = form.watch('phone');

  useEffect(() => {
    const checkPhoneData = async () => {
      if (phone && phone.length >= 11) {
        setIsCheckingMembership(true);
        try {
          // Check membership
          const today = new Date().toISOString().split('T')[0];
          const [membershipRes, ticketRes, historyRes] = await Promise.all([
            supabase
              .from('memberships')
              .select('*')
              .eq('phone', phone)
              .eq('status', 'active')
              .gte('valid_till', today)
              .lte('valid_from', today)
              .maybeSingle(),
            supabase
              .from('tickets')
              .select('guardian_name, notes')
              .eq('guardian_phone', phone)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('tickets')
              .select('id, ticket_number, slot_date, total_price, child_count, guardian_count, status, created_at')
              .eq('guardian_phone', phone)
              .order('created_at', { ascending: false })
              .limit(20),
          ]);

          if (membershipRes.data) {
            setMembershipInfo({
              id: membershipRes.data.id,
              member_name: membershipRes.data.member_name,
              discount_percent: membershipRes.data.discount_percent,
              valid_till: membershipRes.data.valid_till,
            });
          } else {
            setMembershipInfo(null);
          }

          // Auto-fill from previous ticket
          if (ticketRes.data) {
            setPreviousCustomer(true);
            const currentName = form.getValues('guardian_name');
            const currentNotes = form.getValues('notes');
            if (!currentName && ticketRes.data.guardian_name) {
              form.setValue('guardian_name', ticketRes.data.guardian_name);
            }
            if (!currentNotes && ticketRes.data.notes) {
              form.setValue('notes', ticketRes.data.notes);
            }
          } else {
            setPreviousCustomer(false);
          }

          // Visit history
          setVisitHistory((historyRes.data as VisitRecord[]) || []);
          setShowHistory(false);
        } catch {
          setMembershipInfo(null);
          setPreviousCustomer(false);
          setVisitHistory([]);
        } finally {
          setIsCheckingMembership(false);
        }
      } else {
        setMembershipInfo(null);
        setPreviousCustomer(false);
        setVisitHistory([]);
      }
    };
    const debounce = setTimeout(checkPhoneData, 500);
    return () => clearTimeout(debounce);
  }, [phone, form]);

  const openVisitDetail = useCallback(async (ticketId: string) => {
    setSelectedVisit(ticketId);
    setLoadingDetail(true);
    try {
      const [ticketRes, ridesRes] = await Promise.all([
        supabase.from('tickets').select('*').eq('id', ticketId).single(),
        supabase.from('ticket_rides').select('*, rides(name, name_bn)').eq('ticket_id', ticketId),
      ]);
      setVisitDetail({
        ...ticketRes.data,
        rides: ridesRes.data || [],
      });
    } catch {
      setVisitDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const filteredRides = useMemo(() => {
    if (!rideSearch.trim()) return rides;
    const q = rideSearch.toLowerCase();
    return rides.filter(r => r.name.toLowerCase().includes(q) || r.name_bn?.toLowerCase().includes(q));
  }, [rides, rideSearch]);

  const calculatePrices = () => {
    let entryPrice = pricing.entry_price;
    if (guardianCount > 1) entryPrice += (guardianCount - 1) * pricing.extra_guardian_price;
    if (childCount > 1) entryPrice += (childCount - 1) * pricing.extra_child_price;
    const socksPrice = socksCount * pricing.socks_price;
    let ridesPrice = 0;
    Object.entries(selectedRides).forEach(([rideId, quantity]) => {
      const ride = rides.find(r => r.id === rideId);
      if (ride && quantity > 0) ridesPrice += ride.price * quantity;
    });
    const subtotal = entryPrice + socksPrice + ridesPrice;
    const memberDiscount = membershipInfo ? (entryPrice * membershipInfo.discount_percent / 100) : 0;
    const totalDiscount = memberDiscount + discount;
    const total = Math.max(0, subtotal - totalDiscount);
    return { entryPrice, socksPrice, ridesPrice, subtotal, memberDiscount, totalDiscount, total };
  };

  const prices = calculatePrices();

  const toggleRide = (rideId: string) => {
    setSelectedRides(prev => {
      if (prev[rideId]) {
        const { [rideId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [rideId]: 1 };
    });
  };

  const updateRideQuantity = (rideId: string, delta: number) => {
    setSelectedRides(prev => {
      const current = prev[rideId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [rideId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [rideId]: newValue };
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const ridesList = Object.entries(selectedRides)
        .filter(([_, qty]) => qty > 0)
        .map(([ride_id, quantity]) => ({ ride_id, quantity }));

      const { data, error } = await supabase.functions.invoke('create-manual-ticket', {
        body: {
          date: format(new Date(), 'yyyy-MM-dd'),
          guardian_count: guardianCount,
          child_count: childCount,
          socks_count: socksCount,
          rides: ridesList,
          phone: values.phone,
          guardian_name: values.guardian_name,
          notes: values.notes,
          payment_type: values.payment_type,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Ticket created successfully!');

      if (values.payment_type === 'cash' && data.ticket) {
        supabase.functions.invoke('ticket-payment-notify', {
          body: {
            ticket_id: data.ticket.id,
            ticket_number: data.ticket.ticket_number,
            guardian_name: values.guardian_name || 'Guest',
            guardian_phone: values.phone,
            slot_date: format(new Date(), 'yyyy-MM-dd'),
            time_slot: null,
            total_price: prices.total,
            payment_type: 'cash',
          },
        }).catch(() => {});
      }

      form.reset();
      setGuardianCount(1);
      setChildCount(1);
      setSocksCount(1);
      setSelectedRides({});
      setMembershipInfo(null);
      setPreviousCustomer(false);
      setVisitHistory([]);
      setDiscount(0);
      generateEntryNo();
      onSuccess?.(data.ticket);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InlineCounter = ({ value, onInc, onDec, min = 0 }: {
    value: number; onInc: () => void; onDec: () => void; min?: number;
  }) => (
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={onDec} disabled={value <= min}>
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-6 text-center text-sm font-semibold">{value}</span>
      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={onInc}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT COLUMN — Rides & Socks */}
          <div className="border rounded-lg bg-card overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
            <div className="p-3 border-b space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Ticket className="h-4 w-4" /> Rides & Add-ons
                </h3>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => { const all: Record<string, number> = {}; rides.forEach(r => { all[r.id] = 1; }); setSelectedRides(all); }}>
                    Select All
                  </Button>
                  {Object.keys(selectedRides).length > 0 && (
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedRides({})}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search rides..."
                  value={rideSearch}
                  onChange={(e) => setRideSearch(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {/* Socks row */}
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-1 h-6 rounded-full bg-purple-500 shrink-0" />
                  <Footprints className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium flex-1">Socks (pair)</span>
                  <Badge variant="secondary" className="text-xs shrink-0">৳{pricing.socks_price}</Badge>
                  <InlineCounter value={socksCount} onInc={() => setSocksCount(v => v + 1)} onDec={() => setSocksCount(v => Math.max(0, v - 1))} />
                </div>

                <Separator className="my-1" />

                {/* Rides */}
                {filteredRides.map((ride) => {
                  const isSelected = selectedRides[ride.id] > 0;
                  const catColor = CATEGORY_COLORS[ride.category];
                  return (
                    <div
                      key={ride.id}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer',
                        isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'
                      )}
                      onClick={() => toggleRide(ride.id)}
                    >
                      <div className={cn('w-1 h-6 rounded-full shrink-0', catColor)} />
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRide(ride.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                      <span className="text-sm flex-1 truncate">{ride.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">৳{ride.price}</Badge>
                      {isSelected && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <InlineCounter
                            value={selectedRides[ride.id] || 1}
                            onInc={() => updateRideQuantity(ride.id, 1)}
                            onDec={() => updateRideQuantity(ride.id, -1)}
                            min={1}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredRides.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No rides found</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT COLUMN — Form & Pricing */}
          <div className="border rounded-lg bg-card overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Entry No & Customer Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Entry No</Label>
                    <Input value={entryNo} readOnly className="h-8 text-sm bg-muted/50" />
                  </div>
                  <FormField
                    control={form.control}
                    name="guardian_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} className="h-8 text-sm" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Phone *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="01XXXXXXXXX" {...field} className="h-8 text-sm" />
                            {isCheckingMembership && (
                              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Address (optional)" {...field} className="h-8 text-sm" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Previous customer badge */}
                {previousCustomer && !membershipInfo && (
                  <div className="p-2 rounded-md bg-accent/50 border border-accent flex items-center gap-2 text-xs">
                    <UserCheck className="h-4 w-4 text-foreground shrink-0" />
                    <span className="font-medium">Previous customer found — info synced</span>
                  </div>
                )}

                {/* Membership badge */}
                {membershipInfo && (
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs">
                    <Crown className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-primary">{membershipInfo.member_name}</span>
                    {previousCustomer && <Badge variant="outline" className="text-[10px]">Returning</Badge>}
                    <Badge variant="secondary" className="text-[10px] ml-auto">{membershipInfo.discount_percent}% off</Badge>
                  </div>
                )}

                {/* Visit History */}
                {visitHistory.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 p-2 text-xs font-medium hover:bg-muted/50 transition-colors"
                      onClick={() => setShowHistory(v => !v)}
                    >
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Visit History ({visitHistory.length})</span>
                      {showHistory ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                    {showHistory && (
                      <div className="border-t max-h-36 overflow-y-auto">
                        <table className="w-full text-[11px]">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Date</th>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Ticket</th>
                              <th className="text-center px-2 py-1 font-medium text-muted-foreground">C/G</th>
                              <th className="text-right px-2 py-1 font-medium text-muted-foreground">Total</th>
                              <th className="text-center px-2 py-1 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visitHistory.map((v) => (
                              <tr key={v.id} className="border-t border-muted/30 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => openVisitDetail(v.id)}>
                                <td className="px-2 py-1">{format(new Date(v.slot_date), 'dd MMM yy')}</td>
                                <td className="px-2 py-1 font-mono">{v.ticket_number}</td>
                                <td className="px-2 py-1 text-center">{v.child_count || 1}/{v.guardian_count || 1}</td>
                                <td className="px-2 py-1 text-right">৳{v.total_price || 0}</td>
                                <td className="px-2 py-1 text-center">
                                  <Badge variant={v.status === 'used' ? 'secondary' : v.status === 'cancelled' ? 'destructive' : 'default'} className="text-[9px] px-1 py-0">
                                    {v.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Guardian & Children */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Guardians</Label>
                    <InlineCounter value={guardianCount} onInc={() => setGuardianCount(v => v + 1)} onDec={() => setGuardianCount(v => Math.max(1, v - 1))} min={1} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Children</Label>
                    <InlineCounter value={childCount} onInc={() => setChildCount(v => v + 1)} onDec={() => setChildCount(v => Math.max(1, v - 1))} min={1} />
                  </div>
                </div>

                <Separator />

                {/* Price Summary */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span>৳{prices.entryPrice}</span>
                  </div>
                  {prices.socksPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Socks ({socksCount})</span>
                      <span>৳{prices.socksPrice}</span>
                    </div>
                  )}
                  {prices.ridesPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rides</span>
                      <span>৳{prices.ridesPrice}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>৳{prices.subtotal}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">Discount ৳</span>
                    <Input
                      type="number"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="h-7 text-sm w-24"
                      placeholder="0"
                    />
                  </div>
                  {membershipInfo && prices.memberDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-xs">
                      <span>Membership ({membershipInfo.discount_percent}%)</span>
                      <span>-৳{prices.memberDiscount}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Grand Total</span>
                    <span className="text-primary">৳{prices.total}</span>
                  </div>
                </div>

                {/* Valid Until */}
                <div className="p-2 rounded-md bg-muted/50 text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Time</span>
                    <span className="font-medium">{format(new Date(), 'hh:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span className="font-medium">{format(new Date(Date.now() + 60 * 60 * 1000), 'hh:mm a')}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button type="submit" className="w-full" size="default" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Create Ticket</>
                  )}
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>
      </form>
    </Form>

      {/* Visit Detail Modal */}
      <Dialog open={!!selectedVisit} onOpenChange={(open) => { if (!open) { setSelectedVisit(null); setVisitDetail(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4" />
              Ticket Details
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : visitDetail ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground text-xs">Entry No</span>
                  <p className="font-mono font-semibold">{visitDetail.ticket_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Date</span>
                  <p>{format(new Date(visitDetail.slot_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Guardian</span>
                  <p>{visitDetail.guardian_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Phone</span>
                  <p className="font-mono">{visitDetail.guardian_phone}</p>
                </div>
                {visitDetail.child_name && (
                  <div>
                    <span className="text-muted-foreground text-xs">Child Name</span>
                    <p>{visitDetail.child_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Children / Guardians</span>
                  <p>{visitDetail.child_count || 1} / {visitDetail.guardian_count || 1}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground text-xs">Entry Fee</span>
                  <p>৳{visitDetail.entry_price || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Socks ({visitDetail.socks_count || 0})</span>
                  <p>৳{visitDetail.socks_price || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Addons/Rides</span>
                  <p>৳{visitDetail.addons_price || 0}</p>
                </div>
                {(visitDetail.discount_applied || 0) > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Discount</span>
                    <p className="text-green-600">-৳{visitDetail.discount_applied}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Total</span>
                  <p className="font-bold text-base">৳{visitDetail.total_price || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Payment</span>
                  <p className="capitalize">{visitDetail.payment_type || 'N/A'} / {visitDetail.payment_status || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground text-xs">Status</span>
                  <div>
                    <Badge variant={visitDetail.status === 'used' ? 'secondary' : visitDetail.status === 'cancelled' ? 'destructive' : 'default'}>
                      {visitDetail.status}
                    </Badge>
                  </div>
                </div>
                {visitDetail.in_time && (
                  <div>
                    <span className="text-muted-foreground text-xs">In Time</span>
                    <p>{format(new Date(visitDetail.in_time), 'hh:mm a')}</p>
                  </div>
                )}
                {visitDetail.out_time && (
                  <div>
                    <span className="text-muted-foreground text-xs">Out Time</span>
                    <p>{format(new Date(visitDetail.out_time), 'hh:mm a')}</p>
                  </div>
                )}
              </div>

              {/* Rides */}
              {visitDetail.rides && visitDetail.rides.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">Rides / Items</span>
                    <div className="mt-1 space-y-1">
                      {visitDetail.rides.map((r: any) => (
                        <div key={r.id} className="flex justify-between items-center text-xs bg-muted/30 rounded px-2 py-1">
                          <span>{r.rides?.name || 'Unknown'} × {r.quantity}</span>
                          <span className="font-mono">৳{r.total_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {visitDetail.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-xs">Notes</span>
                    <p className="text-xs mt-0.5">{visitDetail.notes}</p>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
  );
}
