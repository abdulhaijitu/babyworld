import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentInitData {
  booking_id: string;
  amount: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
}

interface PaymentResult {
  success: boolean;
  payment_url?: string;
  invoice_id?: string;
  error?: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (data: PaymentInitData): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancel`;

      const { data: result, error: fnError } = await supabase.functions.invoke('initiate-payment', {
        body: {
          ...data,
          redirect_url: redirectUrl,
          cancel_url: cancelUrl
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Payment initiation failed');
      }

      if (result?.success && result?.payment_url) {
        return {
          success: true,
          payment_url: result.payment_url,
          invoice_id: result.invoice_id
        };
      } else {
        throw new Error(result?.error || 'Payment initiation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (invoiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('verify-payment', {
        body: { invoice_id: invoiceId }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Verification failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, verifyPayment, loading, error };
}
