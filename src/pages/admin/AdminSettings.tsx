import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings,
  Banknote,
  Clock,
  Building,
  Save,
  Phone,
  MapPin,
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  Loader2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';
import NotificationTemplateEditor from '@/components/admin/NotificationTemplateEditor';

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('pricing');
  
  const {
    loading,
    saving,
    pricing,
    setPricing,
    timeSlots,
    toggleTimeSlot,
    businessInfo,
    setBusinessInfo,
    notifications,
    setNotifications,
    savePricing,
    saveTimeSlots,
    saveBusinessInfo,
    saveNotifications,
    loadSettings
  } = useSettings();

  const handleSavePricing = async () => {
    try {
      await savePricing();
      toast.success('Pricing saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleSaveTimeSlots = async () => {
    try {
      await saveTimeSlots();
      toast.success('Time slots saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleSaveBusinessInfo = async () => {
    try {
      await saveBusinessInfo();
      toast.success('Business info saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await saveNotifications();
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const enabledSlotsCount = timeSlots.filter(s => s.enabled).length;

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {'Application configuration (saved to database)'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {'Refresh'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="pricing" className="gap-2">
            <Banknote className="w-4 h-4 hidden sm:inline" />
            {'Pricing'}
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building className="w-4 h-4 hidden sm:inline" />
            {'Business'}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <MessageSquare className="w-4 h-4 hidden sm:inline" />
            {'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4 hidden sm:inline" />
            {'General'}
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                {'Hourly Play Pricing'}
              </CardTitle>
              <CardDescription>
                {'Set ticket prices'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{'Child + Guardian'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.childGuardian}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, childGuardian: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{'Child Only'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.childOnly}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, childOnly: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{'Group Discount (%)'}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.groupDiscount}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, groupDiscount: Number(e.target.value) }
                      })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{'Event Package Pricing'}</CardTitle>
              <CardDescription>
                {'Birthday/Private event package prices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{'Basic'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.events.basic}
                      onChange={(e) => setPricing({
                        ...pricing,
                        events: { ...pricing.events, basic: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{'Standard'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.events.standard}
                      onChange={(e) => setPricing({
                        ...pricing,
                        events: { ...pricing.events, standard: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{'Premium'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.events.premium}
                      onChange={(e) => setPricing({
                        ...pricing,
                        events: { ...pricing.events, premium: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{'Deluxe'}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.events.deluxe}
                      onChange={(e) => setPricing({
                        ...pricing,
                        events: { ...pricing.events, deluxe: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                {'Package Pricing'}
              </CardTitle>
              <CardDescription>
                {'Family, Full Board & Ride Zone package prices (managed in Settings → Database)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Package pricing is stored under <code className="text-xs bg-muted px-1 py-0.5 rounded">package_pricing</code> key in settings. 
                Family Regular: ৳500, Eid Special: ৳350, Full Board: ৳800, Extra Guardian: ৳150, Ride Zone Regular: ৳1350, Ride Zone Offer: ৳500.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePricing} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Time Slots Tab */}
        <TabsContent value="timeslots" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {'Time Slot Configuration'}
                  </CardTitle>
                  <CardDescription>
                    {enabledSlotsCount} {'slots enabled'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.enabled ? 'bg-background' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${slot.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={slot.enabled ? '' : 'text-muted-foreground'}>{slot.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {slot.enabled ? (
                        <Badge variant="outline" className="text-green-600 border-green-500/20">
                          {'Active'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {'Disabled'}
                        </Badge>
                      )}
                      <Switch
                        checked={slot.enabled}
                        onCheckedChange={() => toggleTimeSlot(slot.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveTimeSlots} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Business Info Tab */}
        <TabsContent value="business" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                {'Business Information'}
              </CardTitle>
              <CardDescription>
                {'Basic business details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{'Business Name'}</Label>
                <Input
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {'Phone'}
                  </Label>
                  <Input
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {'Email'}
                  </Label>
                  <Input
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {'Address'}
                </Label>
                <Input
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{'Opening Time'}</Label>
                  <Input
                    type="time"
                    value={businessInfo.openingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, openingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{'Closing Time'}</Label>
                  <Input
                    type="time"
                    value={businessInfo.closingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, closingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{'Website'}</Label>
                  <Input
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveBusinessInfo} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {'Notification Channels'}
              </CardTitle>
              <CardDescription>
                {'Select which channels to use for notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{'SMS Notifications'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Send SMS on successful payment'}
                  </p>
                </div>
                <Switch
                  checked={notifications.smsEnabled}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsEnabled: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{'WhatsApp Notifications'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Send WhatsApp on successful payment'}
                  </p>
                </div>
                <Switch
                  checked={notifications.whatsappEnabled}
                  onCheckedChange={(checked) => setNotifications({...notifications, whatsappEnabled: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {'Save Channel Settings'}
            </Button>
          </div>

          {/* Template Editor */}
          <NotificationTemplateEditor />
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {'Theme'}
              </CardTitle>
              <CardDescription>
                {'App color settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{'Dark Mode'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Use dark theme'}
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {'Security'}
              </CardTitle>
              <CardDescription>
                {'Account security settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{'Change Password'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Update your account password'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {'Change'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
