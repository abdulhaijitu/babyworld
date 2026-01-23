import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  Ticket, 
  UtensilsCrossed, 
  TrendingUp, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReportsSummary } from '@/hooks/useReportsSummary';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export function QuickReportsWidget() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data, isLoading } = useReportsSummary('today');

  const stats = [
    {
      label: language === 'bn' ? 'টিকেট' : 'Tickets',
      value: data?.today.tickets || 0,
      subtext: `${data?.today.ticketsUsed || 0} ${language === 'bn' ? 'ব্যবহৃত' : 'used'}`,
      icon: Ticket,
      color: 'text-primary',
    },
    {
      label: language === 'bn' ? 'খাবার' : 'Food',
      value: data?.today.foodOrders || 0,
      subtext: `৳${(data?.today.foodRevenue || 0).toLocaleString()}`,
      icon: UtensilsCrossed,
      color: 'text-chart-2',
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const todayRevenue = (data?.today.foodRevenue || 0);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-chart-2/5 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'bn' ? 'আজকের সারাংশ' : "Today's Summary"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {format(new Date(), 'PPP', { locale: language === 'bn' ? bn : undefined })}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {language === 'bn' ? 'লাইভ' : 'Live'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Revenue Highlight */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
          <div className="p-2 rounded-lg bg-primary/20">
            <Banknote className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">৳{todayRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'আজকের আয়' : "Today's Revenue"}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="p-3 rounded-lg bg-muted/50 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground">{stat.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* View Reports Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => navigate('/admin/reports')}
        >
          {language === 'bn' ? 'বিস্তারিত রিপোর্ট দেখুন' : 'View Full Reports'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
