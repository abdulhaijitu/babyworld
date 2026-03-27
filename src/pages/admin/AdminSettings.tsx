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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Settings,
  Banknote,
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
  MessageSquare,
  Mail,
  CreditCard,
  SendHorizonal,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';
import NotificationTemplateEditor from '@/components/admin/NotificationTemplateEditor';

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const {
    loading,
    saving,
    pricing,
    setPricing,
    packagePricing,
    setPackagePricing,
    businessInfo,
    setBusinessInfo,
    notifications,
    setNotifications,
    smsGateway,
    setSmsGateway,
    paymentGateway,
    setPaymentGateway,
    savePricing,
    saveBusinessInfo,
    saveNotifications,
    saveSmsGateway,
    savePaymentGateway,
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

  const handleSaveSmsGateway = async () => {
    try {
      await saveSmsGateway();
      toast.success('SMS Gateway settings saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleSavePaymentGateway = async () => {
    try {
      await savePaymentGateway();
      toast.success('Payment Gateway settings saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

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
            Settings
          </h1>
          <p className="text-muted-foreground">
            Application configuration (saved to database)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
            <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5 hidden sm:inline" />
              General
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-1.5 text-xs sm:text-sm">
              <Building className="w-3.5 h-3.5 hidden sm:inline" />
              Business
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1.5 text-xs sm:text-sm">
              <Banknote className="w-3.5 h-3.5 hidden sm:inline" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
              <Bell className="w-3.5 h-3.5 hidden sm:inline" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
              <Mail className="w-3.5 h-3.5 hidden sm:inline" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms-gateway" className="gap-1.5 text-xs sm:text-sm">
              <SendHorizonal className="w-3.5 h-3.5 hidden sm:inline" />
              SMS Gateway
            </TabsTrigger>
            <TabsTrigger value="payment-gateway" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5 hidden sm:inline" />
              Payment
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* ==================== GENERAL ==================== */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Theme
              </CardTitle>
              <CardDescription>App color settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== BUSINESS ==================== */}
        <TabsContent value="business" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>Basic business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </Label>
                  <Input
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Email
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
                  <MapPin className="w-4 h-4" /> Address
                </Label>
                <Input
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={businessInfo.openingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, openingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={businessInfo.closingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, closingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
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
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ==================== PRICING ==================== */}
        <TabsContent value="pricing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Hourly Play Pricing
              </CardTitle>
              <CardDescription>Set ticket prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fee for Guardian</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.guardianFee}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, guardianFee: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fee for Child</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.childFee}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, childFee: Number(e.target.value) }
                      })}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Socks Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      value={pricing.hourlyPlay.socksFee}
                      onChange={(e) => setPricing({
                        ...pricing,
                        hourlyPlay: { ...pricing.hourlyPlay, socksFee: Number(e.target.value) }
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
                      <Input
                        type="number"
                        value={pricing.events[tier]}
                        onChange={(e) => setPricing({
                          ...pricing,
                          events: { ...pricing.events, [tier]: Number(e.target.value) }
                        })}
                        className="pl-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Package Pricing
              </CardTitle>
              <CardDescription>Family, Full Board & Ride Zone package prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-2">Family Package</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Regular</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input type="number" value={packagePricing.familyRegular} onChange={(e) => setPackagePricing({...packagePricing, familyRegular: Number(e.target.value)})} className="pl-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eid/Offer</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input type="number" value={packagePricing.familyOffer} onChange={(e) => setPackagePricing({...packagePricing, familyOffer: Number(e.target.value)})} className="pl-8" />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Board</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input type="number" value={packagePricing.fullBoard} onChange={(e) => setPackagePricing({...packagePricing, fullBoard: Number(e.target.value)})} className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Extra Guardian</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                    <Input type="number" value={packagePricing.extraGuardian} onChange={(e) => setPackagePricing({...packagePricing, extraGuardian: Number(e.target.value)})} className="pl-8" />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Ride Zone Package</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Regular</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input type="number" value={packagePricing.rideZoneRegular} onChange={(e) => setPackagePricing({...packagePricing, rideZoneRegular: Number(e.target.value)})} className="pl-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eid/Offer</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                      <Input type="number" value={packagePricing.rideZoneOffer} onChange={(e) => setPackagePricing({...packagePricing, rideZoneOffer: Number(e.target.value)})} className="pl-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePricing} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ==================== NOTIFICATIONS ==================== */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>Select which channels to use for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send SMS on successful payment</p>
                </div>
                <Switch
                  checked={notifications.smsEnabled}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsEnabled: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-muted-foreground">Send WhatsApp on successful payment</p>
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
              Save Channel Settings
            </Button>
          </div>

          <NotificationTemplateEditor />
        </TabsContent>

        {/* ==================== EMAIL CONFIGURE ==================== */}
        <TabsContent value="email" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Email Provider</p>
                    <p className="text-sm text-muted-foreground">SMTP / Transactional Email Service</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                  <XCircle className="w-3.5 h-3.5" />
                  Not Configured
                </Badge>
              </div>

              <Separator />

              {/* Placeholder fields */}
              <div className="space-y-4 opacity-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input placeholder="smtp.example.com" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input placeholder="587" disabled />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="your@email.com" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input placeholder="noreply@yourdomain.com" disabled />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-center">
                <p className="text-sm text-muted-foreground">
                  Email configuration will be available in a future update. Currently, notifications are sent via SMS.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SMS GATEWAY ==================== */}
        <TabsContent value="sms-gateway" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SendHorizonal className="w-5 h-5" />
                SMS Gateway Configuration
              </CardTitle>
              <CardDescription>Configure your SMS API provider for sending notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status bar */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${smsGateway.providerName ? 'bg-green-100 dark:bg-green-950/40' : 'bg-muted'}`}>
                    <Wifi className={`w-5 h-5 ${smsGateway.providerName ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{smsGateway.providerName || 'SMS Provider'}</p>
                    <p className="text-sm text-muted-foreground">Gateway connection status</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`gap-1.5 ${smsGateway.providerName && smsGateway.apiKey 
                    ? 'text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30' 
                    : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'}`}
                >
                  {smsGateway.providerName && smsGateway.apiKey ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Configured</>
                  ) : (
                    <><XCircle className="w-3.5 h-3.5" /> Not Configured</>
                  )}
                </Badge>
              </div>

              <Separator />

              {/* Config fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input
                    placeholder="e.g. ReveCloud, Khudebarta, BulkSMS BD"
                    value={smsGateway.providerName}
                    onChange={(e) => setSmsGateway({...smsGateway, providerName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="Enter your SMS API Key"
                      value={smsGateway.apiKey}
                      onChange={(e) => setSmsGateway({...smsGateway, apiKey: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">This is saved in the database for reference. The actual API key used for sending is stored securely as a backend secret.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      placeholder="e.g. BabyWorld"
                      value={smsGateway.senderId}
                      onChange={(e) => setSmsGateway({...smsGateway, senderId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API URL</Label>
                    <Input
                      placeholder="https://api.provider.com/sms/send"
                      value={smsGateway.apiUrl}
                      onChange={(e) => setSmsGateway({...smsGateway, apiUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSmsGateway} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save SMS Gateway
            </Button>
          </div>
        </TabsContent>

        {/* ==================== PAYMENT GATEWAY ==================== */}
        <TabsContent value="payment-gateway" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Gateway Configuration
              </CardTitle>
              <CardDescription>Manage your online payment gateway settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status bar */}
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
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
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
                    <Button
                      type="button"
                      variant={paymentGateway.mode === 'sandbox' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentGateway({...paymentGateway, mode: 'sandbox'})}
                      className="flex-1"
                    >
                      🧪 Sandbox
                    </Button>
                    <Button
                      type="button"
                      variant={paymentGateway.mode === 'live' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentGateway({...paymentGateway, mode: 'live'})}
                      className="flex-1"
                    >
                      🟢 Live
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    value={paymentGateway.mode === 'sandbox' 
                      ? 'https://sandbox.uddoktapay.com/api' 
                      : 'https://pay.uddoktapay.com/api'}
                    disabled
                    className="bg-muted/50 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    API URL is determined by the selected mode. API keys are stored securely as backend secrets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePaymentGateway} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Payment Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
