import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote, Ticket, UtensilsCrossed, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import type { ReportsSummary } from '@/hooks/useReportsSummary';

interface ReportsSummaryCardsProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

export function ReportsSummaryCards({ data, isLoading }: ReportsSummaryCardsProps) {

  const cards = [
    {
      title: 'Total Revenue',
      value: `৳${(data?.revenue.combinedRevenue || 0).toLocaleString()}`,
      subtitle: 'Tickets + Food',
      icon: Banknote,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Ticket Sales',
      value: data?.tickets.total || 0,
      subtitle: `৳${(data?.revenue.totalTicketRevenue || 0).toLocaleString()}`,
      icon: Ticket,
      color: 'bg-chart-2/10 text-chart-2',
    },
    {
      title: 'Food Sales',
      value: data?.food.completedOrders || 0,
      subtitle: `৳${(data?.food.totalRevenue || 0).toLocaleString()}`,
      icon: UtensilsCrossed,
      color: 'bg-chart-3/10 text-chart-3',
    },
    {
      title: 'Online Revenue',
      value: `৳${(data?.revenue.onlineRevenue || 0).toLocaleString()}`,
      subtitle: `${data?.revenue.onlinePayments || 0} ${''} txn`,
      icon: CreditCard,
      color: 'bg-chart-4/10 text-chart-4',
    },
    {
      title: 'Cash Revenue',
      value: `৳${(data?.revenue.cashRevenue || 0).toLocaleString()}`,
      subtitle: 'Cash payments',
      icon: Wallet,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: "Today's Revenue",
      value: `৳${((data?.today.foodRevenue || 0)).toLocaleString()}`,
      subtitle: `${data?.today.tickets || 0} ${'tickets'}`,
      icon: TrendingUp,
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
              <p className="text-lg font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
