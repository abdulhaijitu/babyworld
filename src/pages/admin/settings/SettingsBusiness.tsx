import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Phone, Globe, MapPin, Save, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsBusiness() {
  const { loading, saving, businessInfo, setBusinessInfo, saveBusinessInfo, loadSettings } = useSettings();

  const handleSave = async () => {
    try {
      await saveBusinessInfo();
      toast.success('Business info saved');
    } catch { toast.error('Failed to save'); }
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
          <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" />Business Information</CardTitle>
          <CardDescription>Basic business details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</Label>
              <Input value={businessInfo.phone} onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Email</Label>
              <Input type="email" value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</Label>
            <Input value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Opening Time</Label>
              <Input type="time" value={businessInfo.openingTime} onChange={(e) => setBusinessInfo({...businessInfo, openingTime: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Closing Time</Label>
              <Input type="time" value={businessInfo.closingTime} onChange={(e) => setBusinessInfo({...businessInfo, closingTime: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={businessInfo.website} onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})} />
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
