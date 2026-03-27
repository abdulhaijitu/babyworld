import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SendHorizonal, Save, Loader2, RefreshCw, CheckCircle2, XCircle, Eye, EyeOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsSms() {
  const { loading, saving, smsGateway, setSmsGateway, saveSmsGateway, loadSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    try { await saveSmsGateway(); toast.success('SMS Gateway settings saved'); }
    catch { toast.error('Failed to save'); }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const isConfigured = smsGateway.providerName && smsGateway.apiKey;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadSettings}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SendHorizonal className="w-5 h-5" />SMS Gateway Configuration</CardTitle>
          <CardDescription>Configure your SMS API provider for sending notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isConfigured ? 'bg-green-100 dark:bg-green-950/40' : 'bg-muted'}`}>
                <Wifi className={`w-5 h-5 ${isConfigured ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium">{smsGateway.providerName || 'SMS Provider'}</p>
                <p className="text-sm text-muted-foreground">Gateway connection status</p>
              </div>
            </div>
            <Badge variant="outline" className={`gap-1.5 ${isConfigured ? 'text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30' : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'}`}>
              {isConfigured ? <><CheckCircle2 className="w-3.5 h-3.5" /> Configured</> : <><XCircle className="w-3.5 h-3.5" /> Not Configured</>}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input placeholder="e.g. ReveCloud, Khudebarta, BulkSMS BD" value={smsGateway.providerName} onChange={(e) => setSmsGateway({...smsGateway, providerName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input type={showApiKey ? 'text' : 'password'} placeholder="Enter your SMS API Key" value={smsGateway.apiKey} onChange={(e) => setSmsGateway({...smsGateway, apiKey: e.target.value})} className="pr-10" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">This is saved in the database for reference. The actual API key used for sending is stored securely as a backend secret.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input placeholder="e.g. BabyWorld" value={smsGateway.senderId} onChange={(e) => setSmsGateway({...smsGateway, senderId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input placeholder="https://api.provider.com/sms/send" value={smsGateway.apiUrl} onChange={(e) => setSmsGateway({...smsGateway, apiUrl: e.target.value})} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />Save SMS Gateway
        </Button>
      </div>
    </div>
  );
}
