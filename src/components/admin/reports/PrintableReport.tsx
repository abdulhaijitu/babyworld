import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import type { ReportsSummary } from '@/hooks/useReportsSummary';
import { format } from 'date-fns';

interface PrintableReportProps {
  data: ReportsSummary;
  onClose: () => void;
}

export function PrintableReport({ data, onClose }: PrintableReportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-1 sm:inset-4 z-50 overflow-auto bg-background rounded-lg shadow-lg">
        {/* Toolbar */}
        <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between print:hidden">
          <h2 className="text-sm sm:text-lg font-semibold">
            {'Report Preview'}
          </h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{'Print'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="p-3 sm:p-8 max-w-4xl mx-auto print:max-w-none print:p-0">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 print:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Baby World</h1>
            <h2 className="text-base sm:text-xl text-muted-foreground">
              {'Sales & Revenue Report'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              {format(new Date(data.period.start_date), 'PPP', { locale: undefined })} 
              {' - '} 
              {format(new Date(data.period.end_date), 'PPP', { locale: undefined })}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {'Generated:'} {format(new Date(), 'PPpp', { locale: undefined })}
            </p>
          </div>

          {/* Revenue Summary */}
          <Card className="mb-4 sm:mb-6 print:shadow-none print:border">
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">
                {'Revenue Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="p-2 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-lg sm:text-2xl font-bold">৳{data.revenue.combinedRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{'Total Revenue'}</p>
                </div>
                <div className="p-2 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-lg sm:text-2xl font-bold">৳{data.revenue.totalTicketRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{'Ticket Revenue'}</p>
                </div>
                <div className="p-2 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-lg sm:text-2xl font-bold">৳{data.revenue.totalFoodRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{'Food Revenue'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <Card className="print:shadow-none print:border">
              <CardHeader className="pb-2 p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-lg">{'Ticket Sales'}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <table className="w-full text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Total Tickets'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.tickets.total}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Online'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.tickets.online}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Physical'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.tickets.physical}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Used'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.tickets.used}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 sm:py-2">{'Active'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.tickets.active}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="print:shadow-none print:border">
              <CardHeader className="pb-2 p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-lg">{'Food Sales'}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <table className="w-full text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Total Orders'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">{data.food.completedOrders}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Total Revenue'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">৳{data.food.totalRevenue.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 sm:py-2">{'Cash'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">৳{data.food.cashRevenue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 sm:py-2">{'Online'}</td>
                      <td className="py-1.5 sm:py-2 text-right font-medium">৳{data.food.onlineRevenue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Top Food Items */}
          {data.food.topItems.length > 0 && (
            <Card className="mb-4 sm:mb-6 print:shadow-none print:border">
              <CardHeader className="pb-2 p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-lg">{'Top Selling Items'}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1.5 sm:py-2 text-left">{'Item'}</th>
                      <th className="py-1.5 sm:py-2 text-center">{'Sold'}</th>
                      <th className="py-1.5 sm:py-2 text-right">{'Revenue'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.food.topItems.slice(0, 5).map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-1.5 sm:py-2">{item.name}</td>
                        <td className="py-1.5 sm:py-2 text-center">{item.count}</td>
                        <td className="py-1.5 sm:py-2 text-right">৳{item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Payment Breakdown */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">{'Payment Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-2 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-base sm:text-xl font-bold">৳{data.revenue.cashRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{'Cash Payments'}</p>
                </div>
                <div className="p-2 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-base sm:text-xl font-bold">৳{data.revenue.onlineRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{'Online Payments'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t text-center text-[10px] sm:text-xs text-muted-foreground">
            <p>Baby World Indoor Playground • {'This report was automatically generated'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
