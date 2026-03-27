import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Save, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPayment() {
  const { loading, saving, paymentGateway, setPaymentGateway, savePaymentGateway, loadSettings } = useSettings();

  const handleSave = async () => {
    try { await savePaymentGateway(); toast.success('Payment Gateway settings saved'); }
    catch { toast.error('Failed to save'); }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadSettings}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Payment Gateway Configuration</CardTitle>
          <CardDescription>Manage your online payment gateway settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-950/40">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">UddoktaPay</p>
                <p className="text-sm text-muted-foreground">Payment gateway provider</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5 text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="w-3.5 h-3.5" />Connected
            </Badge>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gateway Name</Label>
              <Input value="UddoktaPay" disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex gap-3">
                <Button type="button" variant={paymentGateway.mode === 'sandbox' ? 'default' : 'outline'} size="sm" onClick={() => setPaymentGateway({...paymentGateway, mode: 'sandbox'})} className="flex-1">🧪 Sandbox</Button>
                <Button type="button" variant={paymentGateway.mode === 'live' ? 'default' : 'outline'} size="sm" onClick={() => setPaymentGateway({...paymentGateway, mode: 'live'})} className="flex-1">🟢 Live</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API URL</Label>
              <Input value={paymentGateway.mode === 'sandbox' ? 'https://sandbox.uddoktapay.com/api' : 'https://pay.uddoktapay.com/api'} disabled className="bg-muted/50 text-sm" />
              <p className="text-xs text-muted-foreground">API URL is determined by the selected mode. API keys are stored securely as backend secrets.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />Save Payment Settings
        </Button>
      </div>
    </div>
  );
}
