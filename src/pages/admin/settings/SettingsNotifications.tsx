import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Save, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import NotificationTemplateEditor from '@/components/admin/NotificationTemplateEditor';

export default function SettingsNotifications() {
  const { loading, saving, notifications, setNotifications, saveNotifications, loadSettings } = useSettings();

  const handleSave = async () => {
    try { await saveNotifications(); toast.success('Notification settings saved'); }
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
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notification Channels</CardTitle>
          <CardDescription>Select which channels to use for notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Send SMS on successful payment</p>
            </div>
            <Switch checked={notifications.smsEnabled} onCheckedChange={(checked) => setNotifications({...notifications, smsEnabled: checked})} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">WhatsApp Notifications</p>
              <p className="text-sm text-muted-foreground">Send WhatsApp on successful payment</p>
            </div>
            <Switch checked={notifications.whatsappEnabled} onCheckedChange={(checked) => setNotifications({...notifications, whatsappEnabled: checked})} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />Save Channel Settings
        </Button>
      </div>

      <NotificationTemplateEditor />
    </div>
  );
}
