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
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';

export default function AdminSettings() {
  const { language } = useLanguage();
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
      toast.success(language === 'bn' ? 'প্রাইসিং সেভ হয়েছে' : 'Pricing saved');
    } catch (error) {
      toast.error(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save');
    }
  };

  const handleSaveTimeSlots = async () => {
    try {
      await saveTimeSlots();
      toast.success(language === 'bn' ? 'টাইম স্লট সেভ হয়েছে' : 'Time slots saved');
    } catch (error) {
      toast.error(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save');
    }
  };

  const handleSaveBusinessInfo = async () => {
    try {
      await saveBusinessInfo();
      toast.success(language === 'bn' ? 'তথ্য সেভ হয়েছে' : 'Business info saved');
    } catch (error) {
      toast.error(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await saveNotifications();
      toast.success(language === 'bn' ? 'নোটিফিকেশন সেটিংস সেভ হয়েছে' : 'Notification settings saved');
    } catch (error) {
      toast.error(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save');
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
            {language === 'bn' ? 'সেটিংস' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'অ্যাপ্লিকেশন কনফিগারেশন (ডাটাবেসে সংরক্ষিত)' : 'Application configuration (saved to database)'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="pricing" className="gap-2">
            <Banknote className="w-4 h-4 hidden sm:inline" />
            {language === 'bn' ? 'প্রাইসিং' : 'Pricing'}
          </TabsTrigger>
          <TabsTrigger value="timeslots" className="gap-2">
            <Clock className="w-4 h-4 hidden sm:inline" />
            {language === 'bn' ? 'টাইম স্লট' : 'Time Slots'}
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building className="w-4 h-4 hidden sm:inline" />
            {language === 'bn' ? 'ব্যবসায়িক তথ্য' : 'Business'}
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4 hidden sm:inline" />
            {language === 'bn' ? 'জেনারেল' : 'General'}
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                {language === 'bn' ? 'আওয়ারলি প্লে প্রাইসিং' : 'Hourly Play Pricing'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'টিকেটের দাম নির্ধারণ করুন' : 'Set ticket prices'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'শিশু + অভিভাবক' : 'Child + Guardian'}</Label>
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
                  <Label>{language === 'bn' ? 'শুধু শিশু' : 'Child Only'}</Label>
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
                  <Label>{language === 'bn' ? 'গ্রুপ ডিসকাউন্ট (%)' : 'Group Discount (%)'}</Label>
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
              <CardTitle>{language === 'bn' ? 'ইভেন্ট প্যাকেজ প্রাইসিং' : 'Event Package Pricing'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'বার্থডে/প্রাইভেট ইভেন্ট প্যাকেজের দাম' : 'Birthday/Private event package prices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'বেসিক' : 'Basic'}</Label>
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
                  <Label>{language === 'bn' ? 'স্ট্যান্ডার্ড' : 'Standard'}</Label>
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
                  <Label>{language === 'bn' ? 'প্রিমিয়াম' : 'Premium'}</Label>
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
                  <Label>{language === 'bn' ? 'ডিলাক্স' : 'Deluxe'}</Label>
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

          <div className="flex justify-end">
            <Button onClick={handleSavePricing} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'সেভ করুন' : 'Save Changes'}
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
                    {language === 'bn' ? 'টাইম স্লট কনফিগারেশন' : 'Time Slot Configuration'}
                  </CardTitle>
                  <CardDescription>
                    {enabledSlotsCount} {language === 'bn' ? 'টি স্লট সক্রিয়' : 'slots enabled'}
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
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'}
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
              {language === 'bn' ? 'সেভ করুন' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Business Info Tab */}
        <TabsContent value="business" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                {language === 'bn' ? 'ব্যবসায়িক তথ্য' : 'Business Information'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'প্রতিষ্ঠানের মৌলিক তথ্য' : 'Basic business details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'নাম (English)' : 'Name (English)'}</Label>
                  <Input
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
                  <Input
                    value={businessInfo.nameBn}
                    onChange={(e) => setBusinessInfo({...businessInfo, nameBn: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {language === 'bn' ? 'ফোন' : 'Phone'}
                  </Label>
                  <Input
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </Label>
                  <Input
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {language === 'bn' ? 'ঠিকানা (English)' : 'Address (English)'}
                  </Label>
                  <Input
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}
                  </Label>
                  <Input
                    value={businessInfo.addressBn}
                    onChange={(e) => setBusinessInfo({...businessInfo, addressBn: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'খোলার সময়' : 'Opening Time'}</Label>
                  <Input
                    type="time"
                    value={businessInfo.openingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, openingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'বন্ধের সময়' : 'Closing Time'}</Label>
                  <Input
                    type="time"
                    value={businessInfo.closingTime}
                    onChange={(e) => setBusinessInfo({...businessInfo, closingTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'bn' ? 'ওয়েবসাইট' : 'Website'}</Label>
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
              {language === 'bn' ? 'সেভ করুন' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {language === 'bn' ? 'থিম' : 'Theme'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'অ্যাপের রঙ সেটিং' : 'App color settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'অন্ধকার থিম ব্যবহার করুন' : 'Use dark theme'}
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'ইমেইল ও SMS নোটিফিকেশন সেটিংস' : 'Email & SMS notification settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'বুকিং ইমেইল' : 'Booking Email'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'নতুন বুকিংয়ে ইমেইল পাঠান' : 'Send email on new booking'}
                  </p>
                </div>
                <Switch
                  checked={notifications.emailBooking}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailBooking: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'বুকিং SMS' : 'Booking SMS'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'নতুন বুকিংয়ে SMS পাঠান' : 'Send SMS on new booking'}
                  </p>
                </div>
                <Switch
                  checked={notifications.smsBooking}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsBooking: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'পেমেন্ট ইমেইল' : 'Payment Email'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'পেমেন্ট হলে ইমেইল পাঠান' : 'Send email on payment'}
                  </p>
                </div>
                <Switch
                  checked={notifications.emailPayment}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailPayment: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'পেমেন্ট SMS' : 'Payment SMS'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'পেমেন্ট হলে SMS পাঠান' : 'Send SMS on payment'}
                  </p>
                </div>
                <Switch
                  checked={notifications.smsPayment}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsPayment: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'নোটিফিকেশন সেটিংস সেভ করুন' : 'Save Notification Settings'}
            </Button>
          </div>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {language === 'bn' ? 'নিরাপত্তা' : 'Security'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'অ্যাকাউন্ট নিরাপত্তা সেটিংস' : 'Account security settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'আপনার অ্যাকাউন্ট পাসওয়ার্ড আপডেট করুন' : 'Update your account password'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {language === 'bn' ? 'পরিবর্তন' : 'Change'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
