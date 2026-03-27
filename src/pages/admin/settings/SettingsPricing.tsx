import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote, Save, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPricing() {
  const { loading, saving, pricing, setPricing, packagePricing, setPackagePricing, savePricing, loadSettings } = useSettings();

  const handleSave = async () => {
    try { await savePricing(); toast.success('Pricing saved'); }
    catch { toast.error('Failed to save'); }
  };

  if (loading) {
    return <div className="p-4 md:p-6 lg:p-8 space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Banknote className="w-6 h-6" />Pricing Settings</h1>
          <p className="text-muted-foreground">Set ticket and package prices</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSettings}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" />Hourly Play Pricing</CardTitle>
          <CardDescription>Set ticket prices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([['guardianFee', 'Fee for Guardian'], ['childFee', 'Fee for Child'], ['socksFee', 'Socks Fee']] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input type="number" value={pricing.hourlyPlay[key]} onChange={(e) => setPricing({...pricing, hourlyPlay: {...pricing.hourlyPlay, [key]: Number(e.target.value)}})} className="pl-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Package Pricing</CardTitle>
          <CardDescription>Birthday/Private event package prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['basic', 'standard', 'premium', 'deluxe'] as const).map((tier) => (
              <div key={tier} className="space-y-2">
                <Label className="capitalize">{tier}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input type="number" value={pricing.events[tier]} onChange={(e) => setPricing({...pricing, events: {...pricing.events, [tier]: Number(e.target.value)}})} className="pl-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" />Package Pricing</CardTitle>
          <CardDescription>Family, Full Board & Ride Zone package prices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2">Family Package</p>
            <div className="grid grid-cols-2 gap-4">
              {([['familyRegular', 'Regular'], ['familyOffer', 'Eid/Offer']] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input type="number" value={packagePricing[key]} onChange={(e) => setPackagePricing({...packagePricing, [key]: Number(e.target.value)})} className="pl-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            {([['fullBoard', 'Full Board'], ['extraGuardian', 'Extra Guardian']] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input type="number" value={packagePricing[key]} onChange={(e) => setPackagePricing({...packagePricing, [key]: Number(e.target.value)})} className="pl-8" />
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold mb-2">Ride Zone Package</p>
            <div className="grid grid-cols-2 gap-4">
              {([['rideZoneRegular', 'Regular'], ['rideZoneOffer', 'Eid/Offer']] as const).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input type="number" value={packagePricing[key]} onChange={(e) => setPackagePricing({...packagePricing, [key]: Number(e.target.value)})} className="pl-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />Save Changes
        </Button>
      </div>
    </div>
  );
}
