import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, XCircle } from 'lucide-react';

export default function SettingsEmail() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6" />Email Configuration</h1>
        <p className="text-muted-foreground">Configure email notification settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" />Email Configuration</CardTitle>
          <CardDescription>Configure email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted"><Mail className="w-5 h-5 text-muted-foreground" /></div>
              <div>
                <p className="font-medium">Email Provider</p>
                <p className="text-sm text-muted-foreground">SMTP / Transactional Email Service</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <XCircle className="w-3.5 h-3.5" />Not Configured
            </Badge>
          </div>
          <Separator />
          <div className="space-y-4 opacity-60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>SMTP Host</Label><Input placeholder="smtp.example.com" disabled /></div>
              <div className="space-y-2"><Label>SMTP Port</Label><Input placeholder="587" disabled /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Username</Label><Input placeholder="your@email.com" disabled /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" disabled /></div>
            </div>
            <div className="space-y-2"><Label>From Email</Label><Input placeholder="noreply@yourdomain.com" disabled /></div>
          </div>
          <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-center">
            <p className="text-sm text-muted-foreground">Email configuration will be available in a future update. Currently, notifications are sent via SMS.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
