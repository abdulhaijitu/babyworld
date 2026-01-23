import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function useSendSMS() {
  const [sending, setSending] = useState(false);

  const sendSMS = async (phone: string, message: string): Promise<SMSResult> => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phone, message }
      });

      if (error) {
        console.error('[SMS] Error:', error);
        return { success: false, error: error.message };
      }

      return data as SMSResult;
    } catch (err: any) {
      console.error('[SMS] Unexpected error:', err);
      return { success: false, error: err.message };
    } finally {
      setSending(false);
    }
  };

  const sendBookingConfirmation = async (
    phone: string,
    parentName: string,
    slotDate: string,
    timeSlot: string,
    bookingRef: string
  ): Promise<boolean> => {
    const message = `প্রিয় ${parentName},
আপনার Baby World বুকিং নিশ্চিত হয়েছে!

📅 তারিখ: ${slotDate}
⏰ সময়: ${timeSlot}
🎫 রেফারেন্স: ${bookingRef}

প্রবেশের সময় এই মেসেজ দেখান।
📍 Baby World Indoor Playground
📞 +880 1234-567890`;

    const result = await sendSMS(phone, message);
    
    if (result.success) {
      toast.success('SMS সফলভাবে পাঠানো হয়েছে');
    } else {
      toast.error('SMS পাঠাতে ব্যর্থ: ' + (result.error || result.message));
    }
    
    return result.success;
  };

  const sendBookingReminder = async (
    phone: string,
    parentName: string,
    slotDate: string,
    timeSlot: string
  ): Promise<boolean> => {
    const message = `প্রিয় ${parentName},
আপনার Baby World বুকিং আগামীকাল!

📅 তারিখ: ${slotDate}
⏰ সময়: ${timeSlot}

আমরা আপনার জন্য অপেক্ষায় আছি! 🎉
📍 Baby World Indoor Playground`;

    const result = await sendSMS(phone, message);
    return result.success;
  };

  const sendCancellationNotice = async (
    phone: string,
    parentName: string,
    slotDate: string,
    reason?: string
  ): Promise<boolean> => {
    const message = `প্রিয় ${parentName},
আপনার Baby World বুকিং বাতিল করা হয়েছে।

📅 তারিখ: ${slotDate}
${reason ? `📝 কারণ: ${reason}` : ''}

নতুন বুকিংয়ের জন্য যোগাযোগ করুন।
📞 +880 1234-567890`;

    const result = await sendSMS(phone, message);
    return result.success;
  };

  return {
    sending,
    sendSMS,
    sendBookingConfirmation,
    sendBookingReminder,
    sendCancellationNotice
  };
}
