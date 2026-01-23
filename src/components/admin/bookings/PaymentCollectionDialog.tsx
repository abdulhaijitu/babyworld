import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Booking {
  id: string;
  parent_name: string;
  parent_phone: string;
  slot_date: string;
  time_slot: string;
  payment_status: string;
}

interface PaymentCollectionDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PRICE_PER_TICKET = 300;

export function PaymentCollectionDialog({ 
  booking, 
  open, 
  onOpenChange, 
  onSuccess 
}: PaymentCollectionDialogProps) {
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [amount, setAmount] = useState(PRICE_PER_TICKET.toString());
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleCollectPayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      // Update booking payment status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid',
          notes: booking.id ? `${notes ? notes + '\n' : ''}[Payment collected: ৳${amount} via ${paymentMethod}]` : notes
        })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: parseFloat(amount),
          currency: 'BDT',
          status: 'completed',
          payment_method: paymentMethod,
          invoice_id: `INV-${Date.now()}`,
          metadata: {
            collected_at: new Date().toISOString(),
            collected_by: 'counter'
          }
        });

      if (paymentError) {
        console.error('Payment record error:', paymentError);
        // Don't throw - payment status is already updated
      }

      // Log the activity
      await supabase.from('activity_logs').insert({
        entity_type: 'booking',
        entity_id: booking.id,
        action: 'payment_collected',
        details: {
          amount: parseFloat(amount),
          method: paymentMethod,
          notes
        }
      });

      toast.success(language === 'bn' ? 'পেমেন্ট কালেক্ট করা হয়েছে' : 'Payment collected successfully');
      onSuccess();
      onOpenChange(false);

      // Reset form
      setPaymentMethod('cash');
      setAmount(PRICE_PER_TICKET.toString());
      setNotes('');
    } catch (err: any) {
      console.error('Payment collection error:', err);
      toast.error(language === 'bn' ? 'পেমেন্ট কালেকশন ব্যর্থ' : 'Payment collection failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {language === 'bn' ? 'পেমেন্ট কালেকশন' : 'Collect Payment'}
          </DialogTitle>
          <DialogDescription>
            {booking.parent_name} - {format(parseISO(booking.slot_date), 'dd MMM yyyy', { 
              locale: language === 'bn' ? bn : undefined 
            })} ({booking.time_slot})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label>{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as 'cash' | 'online')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <Banknote className="w-4 h-4 text-green-600" />
                  {language === 'bn' ? 'ক্যাশ' : 'Cash'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  {language === 'bn' ? 'অনলাইন' : 'Online/bKash'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Notes (optional)'}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: bKash ট্রান্সেকশন আইডি...' : 'e.g., bKash transaction ID...'}
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{language === 'bn' ? 'মোট' : 'Total'}</span>
              <span className="text-2xl font-bold text-primary">৳{amount || 0}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button onClick={handleCollectPayment} disabled={processing || !amount}>
            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {language === 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
