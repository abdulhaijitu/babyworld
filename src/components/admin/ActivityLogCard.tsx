import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Ticket, 
  Calendar, 
  CreditCard, 
  User,
  Settings,
  UtensilsCrossed,
  Shield,
  Edit,
  Trash2,
  Plus,
  Eye
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function ActivityLogCard() {
  const { language } = useLanguage();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-3 h-3" />;
      case 'update': return <Edit className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      case 'view': return <Eye className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'ticket': return <Ticket className="w-4 h-4" />;
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      case 'food_order': return <UtensilsCrossed className="w-4 h-4" />;
      case 'employee': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-500/10 text-green-600';
      case 'update': return 'bg-blue-500/10 text-blue-600';
      case 'delete': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      create: { en: 'Created', bn: 'তৈরি' },
      update: { en: 'Updated', bn: 'আপডেট' },
      delete: { en: 'Deleted', bn: 'মুছে ফেলা' },
      view: { en: 'Viewed', bn: 'দেখা' }
    };
    return labels[action]?.[language === 'bn' ? 'bn' : 'en'] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      ticket: { en: 'Ticket', bn: 'টিকেট' },
      booking: { en: 'Booking', bn: 'বুকিং' },
      payment: { en: 'Payment', bn: 'পেমেন্ট' },
      user: { en: 'User', bn: 'ইউজার' },
      settings: { en: 'Settings', bn: 'সেটিংস' },
      food_order: { en: 'Food Order', bn: 'ফুড অর্ডার' },
      employee: { en: 'Employee', bn: 'কর্মী' }
    };
    return labels[entityType]?.[language === 'bn' ? 'bn' : 'en'] || entityType;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          {language === 'bn' ? 'সাম্প্রতিক অ্যাক্টিভিটি' : 'Recent Activity'}
        </CardTitle>
        <CardDescription>
          {language === 'bn' ? 'অ্যাডমিন অ্যাকশন লগ' : 'Admin action log'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getEntityIcon(log.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getActionColor(log.action))}
                      >
                        {getActionIcon(log.action)}
                        <span className="ml-1">{getActionLabel(log.action)}</span>
                      </Badge>
                      <span className="text-sm font-medium">
                        {getEntityLabel(log.entity_type)}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                          <span key={key}>{String(value)} </span>
                        ))}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(parseISO(log.created_at), {
                        addSuffix: true,
                        locale: language === 'bn' ? bn : undefined
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'bn' ? 'কোনো অ্যাক্টিভিটি নেই' : 'No activity yet'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
