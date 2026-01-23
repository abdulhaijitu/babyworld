import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Save, 
  RotateCcw, 
  Loader2,
  Ticket,
  UtensilsCrossed,
  CreditCard,
  Bell,
  Info
} from 'lucide-react';

interface TemplateContent {
  bn: string;
  en: string;
}

interface NotificationTemplates {
  ticket_payment: TemplateContent;
  food_order: TemplateContent;
  booking_payment: TemplateContent;
  booking_reminder: TemplateContent;
}

const defaultTemplates: NotificationTemplates = {
  ticket_payment: {
    bn: "🎟️ Baby World টিকিট কনফার্ম!\nটিকিট: {{ticket_number}}\nতারিখ: {{date}}\nসময়: {{time_slot}}\nমোট: ৳{{total}}\nধন্যবাদ {{name}}!",
    en: "🎟️ Baby World Ticket Confirmed!\nTicket: {{ticket_number}}\nDate: {{date}}\nTime: {{time_slot}}\nTotal: ৳{{total}}\nThank you {{name}}!"
  },
  food_order: {
    bn: "🍔 Baby World ফুড অর্ডার কনফার্ম!\nঅর্ডার: {{order_number}}\nমোট: ৳{{total}}\nধন্যবাদ {{name}}!",
    en: "🍔 Food Order Confirmed!\nOrder: {{order_number}}\nTotal: ৳{{total}}\nThank you {{name}}!"
  },
  booking_payment: {
    bn: "✅ Baby World বুকিং পেমেন্ট সফল!\nতারিখ: {{date}}\nসময়: {{time_slot}}\nমোট: ৳{{total}}\nধন্যবাদ {{name}}!",
    en: "✅ Booking Payment Successful!\nDate: {{date}}\nTime: {{time_slot}}\nTotal: ৳{{total}}\nThank you {{name}}!"
  },
  booking_reminder: {
    bn: "⏰ Baby World রিমাইন্ডার!\nআগামীকাল আপনার বুকিং আছে।\nতারিখ: {{date}}\nসময়: {{time_slot}}\nঅপেক্ষায় থাকলাম!",
    en: "⏰ Baby World Reminder!\nYou have a booking tomorrow.\nDate: {{date}}\nTime: {{time_slot}}\nSee you soon!"
  }
};

const templateInfo = {
  ticket_payment: {
    icon: Ticket,
    label: 'Ticket Payment',
    labelBn: 'টিকিট পেমেন্ট',
    variables: ['{{ticket_number}}', '{{date}}', '{{time_slot}}', '{{total}}', '{{name}}']
  },
  food_order: {
    icon: UtensilsCrossed,
    label: 'Food Order',
    labelBn: 'ফুড অর্ডার',
    variables: ['{{order_number}}', '{{total}}', '{{name}}']
  },
  booking_payment: {
    icon: CreditCard,
    label: 'Booking Payment',
    labelBn: 'বুকিং পেমেন্ট',
    variables: ['{{date}}', '{{time_slot}}', '{{total}}', '{{name}}']
  },
  booking_reminder: {
    icon: Bell,
    label: 'Booking Reminder',
    labelBn: 'বুকিং রিমাইন্ডার',
    variables: ['{{date}}', '{{time_slot}}', '{{name}}']
  }
};

export default function NotificationTemplateEditor() {
  const { language } = useLanguage();
  const [templates, setTemplates] = useState<NotificationTemplates>(defaultTemplates);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof NotificationTemplates>('ticket_payment');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'notification_templates')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
        const value = data.value as Record<string, unknown>;
        if (value.ticket_payment && value.food_order && value.booking_payment && value.booking_reminder) {
          setTemplates(value as unknown as NotificationTemplates);
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'notification_templates')
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(templates));

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value: jsonValue })
          .eq('key', 'notification_templates');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([{
            key: 'notification_templates',
            category: 'notifications',
            value: jsonValue
          }]);
        if (error) throw error;
      }

      toast.success(language === 'bn' ? 'টেমপ্লেট সেভ হয়েছে!' : 'Templates saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(language === 'bn' ? 'সেভ ব্যর্থ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (type: keyof NotificationTemplates) => {
    setTemplates(prev => ({
      ...prev,
      [type]: defaultTemplates[type]
    }));
    toast.info(language === 'bn' ? 'ডিফল্ট টেমপ্লেটে রিসেট হয়েছে' : 'Reset to default template');
  };

  const updateTemplate = (type: keyof NotificationTemplates, lang: 'bn' | 'en', value: string) => {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [lang]: value
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentInfo = templateInfo[activeTab];
  const Icon = currentInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {language === 'bn' ? 'নোটিফিকেশন টেমপ্লেট' : 'Notification Templates'}
        </CardTitle>
        <CardDescription>
          {language === 'bn' 
            ? 'SMS ও WhatsApp মেসেজ কাস্টমাইজ করুন। ভেরিয়েবল ব্যবহার করতে {{variable}} ফরম্যাট ব্যবহার করুন।'
            : 'Customize SMS & WhatsApp messages. Use {{variable}} format for dynamic content.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as keyof NotificationTemplates)}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {Object.entries(templateInfo).map(([key, info]) => {
              const TabIcon = info.icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-2">
                  <TabIcon className="w-4 h-4 hidden sm:inline" />
                  <span className="text-xs sm:text-sm">
                    {language === 'bn' ? info.labelBn : info.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(templates).map(([type, content]) => (
            <TabsContent key={type} value={type} className="mt-6 space-y-6">
              {/* Available Variables */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'ব্যবহারযোগ্য ভেরিয়েবল:' : 'Available variables:'}
                </span>
                {templateInfo[type as keyof NotificationTemplates].variables.map((v) => (
                  <Badge key={v} variant="secondary" className="font-mono text-xs">
                    {v}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bangla Template */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    🇧🇩 {language === 'bn' ? 'বাংলা টেমপ্লেট' : 'Bangla Template'}
                  </Label>
                  <Textarea
                    value={content.bn}
                    onChange={(e) => updateTemplate(type as keyof NotificationTemplates, 'bn', e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.bn.length} {language === 'bn' ? 'অক্ষর' : 'characters'}
                  </p>
                </div>

                {/* English Template */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    🇬🇧 {language === 'bn' ? 'ইংরেজি টেমপ্লেট' : 'English Template'}
                  </Label>
                  <Textarea
                    value={content.en}
                    onChange={(e) => updateTemplate(type as keyof NotificationTemplates, 'en', e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.en.length} {language === 'bn' ? 'অক্ষর' : 'characters'}
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'প্রিভিউ (বাংলা)' : 'Preview (Bangla)'}</Label>
                <div className="p-4 rounded-lg bg-muted/30 border whitespace-pre-wrap text-sm">
                  {content.bn
                    .replace('{{ticket_number}}', 'TKT-123456')
                    .replace('{{order_number}}', 'ORD-789')
                    .replace('{{date}}', '২০২৬-০১-২৩')
                    .replace('{{time_slot}}', '১০:০০ AM - ১১:০০ AM')
                    .replace('{{total}}', '৫০০')
                    .replace('{{name}}', 'রহিম')}
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleReset(type as keyof NotificationTemplates)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset to Default'}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {language === 'bn' ? 'সব টেমপ্লেট সেভ করুন' : 'Save All Templates'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
