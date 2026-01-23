import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { CalendarIcon, Loader2, Clock, Users, Phone, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  time_slot: z.string().min(1, 'Time slot is required'),
  parent_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  parent_phone: z.string()
    .min(11, 'Phone number must be at least 11 digits')
    .regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  ticket_type: z.enum(['child_guardian', 'child_only', 'group']),
  booking_type: z.enum(['hourly_play', 'birthday_event', 'private_event']),
  payment_status: z.enum(['paid', 'unpaid', 'pending']),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Slot {
  id: string;
  time_slot: string;
  status: 'available' | 'booked';
}

interface ManualBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM',
];

export function ManualBookingForm({ onSuccess, onCancel }: ManualBookingFormProps) {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time_slot: '',
      parent_name: '',
      parent_phone: '',
      ticket_type: 'child_guardian',
      booking_type: 'hourly_play',
      payment_status: 'unpaid',
      notes: '',
    },
  });

  const selectedDate = form.watch('date');

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;
      
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { data } = await supabase
          .from('slots')
          .select('id, time_slot, status')
          .eq('slot_date', dateStr);

        if (data) {
          setAvailableSlots(data as Slot[]);
        } else {
          // If no slots exist for this date, show all as available
          setAvailableSlots(TIME_SLOTS.map((ts, i) => ({
            id: `temp-${i}`,
            time_slot: ts,
            status: 'available' as const
          })));
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
    // Reset time slot when date changes
    form.setValue('time_slot', '');
  }, [selectedDate, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const dateStr = format(values.date, 'yyyy-MM-dd');
      
      // Check if slot exists, if not create it
      let slotId = null;
      const existingSlot = availableSlots.find(s => s.time_slot === values.time_slot);
      
      if (existingSlot && !existingSlot.id.startsWith('temp-')) {
        // Update existing slot
        const { error: slotError } = await supabase
          .from('slots')
          .update({ status: 'booked' })
          .eq('id', existingSlot.id);
        
        if (slotError) throw slotError;
        slotId = existingSlot.id;
      } else {
        // Create new slot
        const [startTime] = values.time_slot.split(' - ');
        const endTime = values.time_slot.split(' - ')[1];
        
        const { data: newSlot, error: createError } = await supabase
          .from('slots')
          .insert({
            slot_date: dateStr,
            time_slot: values.time_slot,
            start_time: startTime,
            end_time: endTime,
            status: 'booked'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        slotId = newSlot.id;
      }

      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slot_id: slotId,
          slot_date: dateStr,
          time_slot: values.time_slot,
          parent_name: values.parent_name.trim(),
          parent_phone: values.parent_phone.replace(/[\s\-]/g, ''),
          ticket_type: values.ticket_type,
          booking_type: values.booking_type,
          status: 'confirmed',
          payment_status: values.payment_status,
          notes: values.notes?.trim() || null,
        });

      if (bookingError) throw bookingError;

      // Log activity
      await supabase.from('activity_logs').insert({
        entity_type: 'booking',
        action: 'manual_booking_created',
        details: {
          parent_name: values.parent_name,
          date: dateStr,
          time_slot: values.time_slot,
          source: 'counter'
        }
      });

      toast.success(language === 'bn' ? 'বুকিং সফল হয়েছে!' : 'Booking created successfully!');
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || (language === 'bn' ? 'বুকিং ব্যর্থ হয়েছে' : 'Booking failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSlotStatus = (timeSlot: string) => {
    const slot = availableSlots.find(s => s.time_slot === timeSlot);
    return slot?.status || 'available';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Selection */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </FormLabel>
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

        {/* Time Slot Selection */}
        <FormField
          control={form.control}
          name="time_slot"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {language === 'bn' ? 'সময় স্লট' : 'Time Slot'}
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {loadingSlots ? (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    TIME_SLOTS.map((slot) => {
                      const status = getSlotStatus(slot);
                      const isSelected = field.value === slot;
                      const isBooked = status === 'booked';
                      
                      return (
                        <Button
                          key={slot}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={isBooked}
                          className={cn(
                            'h-auto py-2 px-3 text-xs',
                            isBooked && 'opacity-50 cursor-not-allowed',
                            isSelected && 'ring-2 ring-primary'
                          )}
                          onClick={() => !isBooked && field.onChange(slot)}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{slot}</span>
                            {isBooked && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                {language === 'bn' ? 'বুকড' : 'Booked'}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      );
                    })
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="parent_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === 'bn' ? 'অভিভাবকের নাম' : 'Parent Name'}
                </FormLabel>
                <FormControl>
                  <Input placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parent_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                </FormLabel>
                <FormControl>
                  <Input placeholder="01XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Booking Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticket_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'bn' ? 'টিকেট টাইপ' : 'Ticket Type'}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="child_guardian">
                      {language === 'bn' ? 'শিশু + অভিভাবক' : 'Child + Guardian'}
                    </SelectItem>
                    <SelectItem value="child_only">
                      {language === 'bn' ? 'শুধু শিশু' : 'Child Only'}
                    </SelectItem>
                    <SelectItem value="group">
                      {language === 'bn' ? 'গ্রুপ' : 'Group'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'bn' ? 'বুকিং টাইপ' : 'Booking Type'}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly_play">
                      {language === 'bn' ? 'ঘণ্টাভিত্তিক খেলা' : 'Hourly Play'}
                    </SelectItem>
                    <SelectItem value="birthday_event">
                      {language === 'bn' ? 'জন্মদিন ইভেন্ট' : 'Birthday Event'}
                    </SelectItem>
                    <SelectItem value="private_event">
                      {language === 'bn' ? 'প্রাইভেট ইভেন্ট' : 'Private Event'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Status */}
        <FormField
          control={form.control}
          name="payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="text-green-600 font-medium">
                      {language === 'bn' ? 'পরিশোধিত' : 'Paid'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unpaid" id="unpaid" />
                    <Label htmlFor="unpaid">
                      {language === 'bn' ? 'অপরিশোধিত' : 'Unpaid'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="text-amber-600">
                      {language === 'bn' ? 'অপেক্ষমান' : 'Pending'}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Notes (Optional)'}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={language === 'bn' ? 'অতিরিক্ত তথ্য...' : 'Additional notes...'} 
                  {...field} 
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'বুকিং করুন' : 'Create Booking'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
