import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { CalendarIcon, Plus, Minus, Ticket, Users, Baby, Footprints, Loader2, CheckCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  guardian_name: z.string().optional(),
  phone: z.string().min(11, 'Phone number must be at least 11 digits').regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  notes: z.string().optional(),
  payment_type: z.enum(['cash', 'online']),
});

type FormValues = z.infer<typeof formSchema>;

interface Ride {
  id: string;
  name: string;
  name_bn: string | null;
  price: number;
  is_active: boolean;
}

interface MembershipInfo {
  id: string;
  member_name: string;
  discount_percent: number;
  valid_till: string;
}

interface CounterTicketFormProps {
  onSuccess?: (ticket: any) => void;
}

export function CounterTicketForm({ onSuccess }: CounterTicketFormProps) {
  const { language } = useLanguage();
  
  const [guardianCount, setGuardianCount] = useState(1);
  const [childCount, setChildCount] = useState(1);
  const [socksCount, setSocksCount] = useState(1);
  const [selectedRides, setSelectedRides] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);

  // Fetch rides
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

  // Fetch ticket pricing from settings
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

  // Get pricing from settings
  const pricing = ticketPricing || {
    entry_price: 500,
    extra_guardian_price: 100,
    extra_child_price: 200,
    socks_price: 50
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      guardian_name: '',
      phone: '',
      notes: '',
      payment_type: 'cash',
    },
  });

  const phone = form.watch('phone');

  // Check membership when phone changes
  useEffect(() => {
    const checkMembership = async () => {
      if (phone && phone.length >= 11) {
        setIsCheckingMembership(true);
        try {
          // Check membership by phone using direct query (edge function may not be deployed)
          const today = new Date().toISOString().split('T')[0];
          const { data: membership } = await supabase
            .from('memberships')
            .select('*')
            .eq('phone', phone)
            .eq('status', 'active')
            .gte('valid_till', today)
            .lte('valid_from', today)
            .maybeSingle();
          
          if (membership) {
            setMembershipInfo({
              id: membership.id,
              member_name: membership.member_name,
              discount_percent: membership.discount_percent,
              valid_till: membership.valid_till,
            });
          } else {
            setMembershipInfo(null);
          }
        } catch (error) {
          console.error('Membership check error:', error);
          setMembershipInfo(null);
        } finally {
          setIsCheckingMembership(false);
        }
      } else {
        setMembershipInfo(null);
      }
    };

    const debounce = setTimeout(checkMembership, 500);
    return () => clearTimeout(debounce);
  }, [phone]);

  // Calculate prices
  const calculatePrices = () => {
    let entryPrice = pricing.entry_price;
    
    // Extra guardians
    if (guardianCount > 1) {
      entryPrice += (guardianCount - 1) * pricing.extra_guardian_price;
    }
    
    // Extra children
    if (childCount > 1) {
      entryPrice += (childCount - 1) * pricing.extra_child_price;
    }

    const socksPrice = socksCount * pricing.socks_price;

    // Rides price
    let ridesPrice = 0;
    Object.entries(selectedRides).forEach(([rideId, quantity]) => {
      const ride = rides.find(r => r.id === rideId);
      if (ride && quantity > 0) {
        ridesPrice += ride.price * quantity;
      }
    });

    const subtotal = entryPrice + socksPrice + ridesPrice;
    const discountAmount = membershipInfo ? (entryPrice * membershipInfo.discount_percent / 100) : 0;
    const total = subtotal - discountAmount;

    return { entryPrice, socksPrice, ridesPrice, subtotal, discountAmount, total };
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
          date: format(values.date, 'yyyy-MM-dd'),
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

      toast.success(language === 'bn' ? 'টিকেট তৈরি হয়েছে!' : 'Ticket created successfully!');
      
      // Reset form
      form.reset();
      setGuardianCount(1);
      setChildCount(1);
      setSocksCount(1);
      setSelectedRides({});
      setMembershipInfo(null);

      onSuccess?.(data.ticket);
    } catch (error: any) {
      toast.error(error.message || (language === 'bn' ? 'টিকেট তৈরি ব্যর্থ' : 'Failed to create ticket'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const CounterButton = ({ value, onIncrement, onDecrement, min = 0 }: { 
    value: number; 
    onIncrement: () => void; 
    onDecrement: () => void;
    min?: number;
  }) => (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrement}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-bold">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrement}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Customer Info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  {language === 'bn' ? 'টিকেট তথ্য' : 'Ticket Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === 'bn' ? 'তারিখ' : 'Date'}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: language === 'bn' ? bn : undefined })
                                ) : (
                                  <span>{language === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Pick a date'}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="01XXXXXXXXX" {...field} />
                            {isCheckingMembership && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Membership Badge */}
                {membershipInfo && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
                    <Crown className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-primary">
                        {language === 'bn' ? 'মেম্বারশিপ সক্রিয়!' : 'Membership Active!'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {membershipInfo.member_name} • {membershipInfo.discount_percent}% {language === 'bn' ? 'ছাড়' : 'discount'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {language === 'bn' ? 'মেয়াদ:' : 'Valid till:'} {membershipInfo.valid_till}
                    </Badge>
                  </div>
                )}

                {/* Guardian Name */}
                <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Entry Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'bn' ? 'প্রবেশের বিবরণ' : 'Entry Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Guardian Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {language === 'bn' ? 'অভিভাবক সংখ্যা' : 'Guardian Count'}
                    </Label>
                    <CounterButton
                      value={guardianCount}
                      onIncrement={() => setGuardianCount(v => v + 1)}
                      onDecrement={() => setGuardianCount(v => Math.max(1, v - 1))}
                      min={1}
                    />
                    {guardianCount > 1 && (
                      <p className="text-xs text-muted-foreground">
                        +৳{(guardianCount - 1) * pricing.extra_guardian_price} {language === 'bn' ? 'অতিরিক্ত' : 'extra'}
                      </p>
                    )}
                  </div>

                  {/* Child Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Baby className="h-4 w-4" />
                      {language === 'bn' ? 'শিশু সংখ্যা' : 'Child Count'}
                    </Label>
                    <CounterButton
                      value={childCount}
                      onIncrement={() => setChildCount(v => v + 1)}
                      onDecrement={() => setChildCount(v => Math.max(1, v - 1))}
                      min={1}
                    />
                    {childCount > 1 && (
                      <p className="text-xs text-muted-foreground">
                        +৳{(childCount - 1) * pricing.extra_child_price} {language === 'bn' ? 'অতিরিক্ত' : 'extra'}
                      </p>
                    )}
                  </div>

                  {/* Socks Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Footprints className="h-4 w-4" />
                      {language === 'bn' ? 'মোজা (জোড়া)' : 'Socks (pairs)'}
                    </Label>
                    <CounterButton
                      value={socksCount}
                      onIncrement={() => setSocksCount(v => v + 1)}
                      onDecrement={() => setSocksCount(v => Math.max(0, v - 1))}
                      min={0}
                    />
                    {socksCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ৳{socksCount * pricing.socks_price}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rides Selection */}
            {rides.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>{language === 'bn' ? 'রাইড যোগ করুন (ঐচ্ছিক)' : 'Add Rides (Optional)'}</CardTitle>
                  <CardDescription>
                    {language === 'bn' ? 'অতিরিক্ত রাইড নির্বাচন করুন' : 'Select additional rides'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {rides.map((ride) => {
                      const isSelected = selectedRides[ride.id] > 0;
                        return (
                          <div
                            key={ride.id}
                            className={cn(
                              'p-3 rounded-lg border cursor-pointer transition-all',
                              isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                            )}
                            onClick={() => toggleRide(ride.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Checkbox 
                                checked={isSelected} 
                                onCheckedChange={() => toggleRide(ride.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Badge variant="secondary">৳{ride.price}</Badge>
                            </div>
                            <p className="font-medium text-sm">
                              {language === 'bn' ? ride.name_bn || ride.name : ride.name}
                            </p>
                            {isSelected && (
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <CounterButton
                                  value={selectedRides[ride.id] || 1}
                                  onIncrement={() => updateRideQuantity(ride.id, 1)}
                                  onDecrement={() => updateRideQuantity(ride.id, -1)}
                                  min={1}
                                />
                              </div>
                            )}
                          </div>
                        );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes & Payment */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{language === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'bn' ? 'নোট' : 'Notes'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={language === 'bn' ? 'বিশেষ নির্দেশনা...' : 'Special instructions...'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="cash" />
                            <Label htmlFor="cash">{language === 'bn' ? 'নগদ' : 'Cash'}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online">{language === 'bn' ? 'অনলাইন' : 'Online'}</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle>{language === 'bn' ? 'মূল্য বিবরণ' : 'Price Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'bn' ? 'এন্ট্রি ফি' : 'Entry Fee'}
                    </span>
                    <span>৳{prices.entryPrice}</span>
                  </div>
                  
                  {prices.socksPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'bn' ? 'মোজা' : 'Socks'} ({socksCount})
                      </span>
                      <span>৳{prices.socksPrice}</span>
                    </div>
                  )}

                  {prices.ridesPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'bn' ? 'রাইড' : 'Rides'}
                      </span>
                      <span>৳{prices.ridesPrice}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}
                    </span>
                    <span>৳{prices.subtotal}</span>
                  </div>

                  {membershipInfo && prices.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        {language === 'bn' ? 'মেম্বারশিপ ছাড়' : 'Membership Discount'} ({membershipInfo.discount_percent}%)
                      </span>
                      <span>-৳{prices.discountAmount}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                    <span className="text-primary">৳{prices.total}</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'bn' ? 'প্রবেশ সময়' : 'In Time'}</span>
                    <span className="font-medium">{format(new Date(), 'hh:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'bn' ? 'বের হওয়ার সময়' : 'Out Time'}</span>
                    <span className="font-medium">{format(new Date(Date.now() + 60 * 60 * 1000), 'hh:mm a')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'bn' ? '১ ঘণ্টার জন্য বৈধ' : 'Valid for 1 hour'}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {language === 'bn' ? 'টিকেট তৈরি করুন' : 'Create Ticket'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
