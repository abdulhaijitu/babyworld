import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import babyWorldLogo from '@/assets/baby-world-logo.png';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-muted p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={babyWorldLogo} alt="Baby World" className="h-12 w-auto" />
          </div>
          
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          
          <CardTitle className="text-2xl text-destructive">
            {language === 'bn' ? 'পেমেন্ট বাতিল হয়েছে' : 'Payment Cancelled'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? 'আপনার পেমেন্ট সম্পন্ন হয়নি। আপনি চাইলে আবার চেষ্টা করতে পারেন।'
              : 'Your payment was not completed. You can try again if you wish.'}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/play-booking')} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
