import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Home, CalendarCheck } from 'lucide-react';
import babyWorldLogo from '@/assets/baby-world-logo.png';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { verifyPayment, loading } = usePayment();
  const [verified, setVerified] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const invoiceId = searchParams.get('invoice_id');

  useEffect(() => {
    if (invoiceId) {
      verifyPayment(invoiceId).then((result) => {
        if (result?.success) {
          setPaymentData(result.payment);
          setVerified(true);
        }
      });
    }
  }, [invoiceId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={babyWorldLogo} alt="Baby World" className="h-12 w-auto" />
          </div>
          
          {loading ? (
            <div className="py-8">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                {language === 'bn' ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'Verifying payment...'}
              </p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                {language === 'bn' ? 'পেমেন্ট সফল!' : 'Payment Successful!'}
              </CardTitle>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!loading && (
            <>
              <p className="text-muted-foreground">
                {language === 'bn' 
                  ? 'আপনার বুকিং সম্পূর্ণ হয়েছে। আমরা আপনাকে স্বাগত জানাতে অপেক্ষা করছি!'
                  : 'Your booking is complete. We look forward to seeing you!'}
              </p>

              {paymentData && (
                <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-mono text-sm">{invoiceId}</span>
                  </div>
                  {paymentData.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-sm">{paymentData.transaction_id}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/')} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/play-booking')}>
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'আরো বুকিং করুন' : 'Book Another Session'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
