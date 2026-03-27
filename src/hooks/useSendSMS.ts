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
    const message = `Dear ${parentName},
Your Baby World booking is confirmed!

📅 Date: ${slotDate}
⏰ Time: ${timeSlot}
🎫 Reference: ${bookingRef}

Please show this message at entry.
📍 Baby World Indoor Playground
📞 +880 1234-567890`;

    const result = await sendSMS(phone, message);
    
    if (result.success) {
      toast.success('SMS sent successfully');
    } else {
      toast.error('Failed to send SMS: ' + (result.error || result.message));
    }
    
    return result.success;
  };

  const sendBookingReminder = async (
    phone: string,
    parentName: string,
    slotDate: string,
    timeSlot: string
  ): Promise<boolean> => {
    const message = `Dear ${parentName},
Your Baby World booking is tomorrow!

📅 Date: ${slotDate}
⏰ Time: ${timeSlot}

We look forward to seeing you! 🎉
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
    const message = `Dear ${parentName},
Your Baby World booking has been cancelled.

📅 Date: ${slotDate}
${reason ? `📝 Reason: ${reason}` : ''}

Please contact us for a new booking.
📞 +880 1234-567890`;

    const result = await sendSMS(phone, message);
    return result.success;
  };

  // Generate WhatsApp link for booking confirmation
  const getWhatsAppLink = (
    phone: string,
    parentName: string,
    slotDate: string,
    timeSlot: string,
    bookingRef: string
  ): string => {
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '88' + formattedPhone;
    } else if (!formattedPhone.startsWith('88')) {
      formattedPhone = '88' + formattedPhone;
    }

    const message = encodeURIComponent(`Dear ${parentName},
Your Baby World booking is confirmed!

📅 Date: ${slotDate}
⏰ Time: ${timeSlot}
🎫 Reference: ${bookingRef}

Please show this message at entry.
📍 Baby World Indoor Playground
📞 +880 1234-567890`);

    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const openWhatsApp = (
    phone: string,
    parentName: string,
    slotDate: string,
    timeSlot: string,
    bookingRef: string
  ): void => {
    const link = getWhatsAppLink(phone, parentName, slotDate, timeSlot, bookingRef);
    window.open(link, '_blank');
    toast.success('WhatsApp opened');
  };

  return {
    sending,
    sendSMS,
    sendBookingConfirmation,
    sendBookingReminder,
    sendCancellationNotice,
    getWhatsAppLink,
    openWhatsApp
  };
}