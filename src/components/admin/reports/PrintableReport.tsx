import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ReportsSummary } from '@/hooks/useReportsSummary';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface PrintableReportProps {
  data: ReportsSummary;
  onClose: () => void;
}

export function PrintableReport({ data, onClose }: PrintableReportProps) {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 overflow-auto bg-background rounded-lg shadow-lg">
        {/* Toolbar */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold">
            {language === 'bn' ? 'রিপোর্ট প্রিভিউ' : 'Report Preview'}
          </h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'প্রিন্ট করুন' : 'Print'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="p-8 max-w-4xl mx-auto print:max-w-none print:p-0">
          {/* Header */}
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-3xl font-bold mb-2">Baby World</h1>
            <h2 className="text-xl text-muted-foreground">
              {language === 'bn' ? 'সেলস ও রেভিনিউ রিপোর্ট' : 'Sales & Revenue Report'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {format(new Date(data.period.start_date), 'PPP', { locale: language === 'bn' ? bn : undefined })} 
              {' - '} 
              {format(new Date(data.period.end_date), 'PPP', { locale: language === 'bn' ? bn : undefined })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'bn' ? 'তৈরির তারিখ:' : 'Generated:'} {format(new Date(), 'PPpp', { locale: language === 'bn' ? bn : undefined })}
            </p>
          </div>

          {/* Revenue Summary */}
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {language === 'bn' ? 'রেভিনিউ সারাংশ' : 'Revenue Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">৳{data.revenue.combinedRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">৳{data.revenue.totalTicketRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'টিকেট আয়' : 'Ticket Revenue'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">৳{data.revenue.totalFoodRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'খাবার আয়' : 'Food Revenue'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Stats */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {language === 'bn' ? 'টিকেট বিক্রয়' : 'Ticket Sales'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'মোট টিকেট' : 'Total Tickets'}</td>
                      <td className="py-2 text-right font-medium">{data.tickets.total}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'অনলাইন' : 'Online'}</td>
                      <td className="py-2 text-right font-medium">{data.tickets.online}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'ফিজিক্যাল' : 'Physical'}</td>
                      <td className="py-2 text-right font-medium">{data.tickets.physical}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'ব্যবহৃত' : 'Used'}</td>
                      <td className="py-2 text-right font-medium">{data.tickets.used}</td>
                    </tr>
                    <tr>
                      <td className="py-2">{language === 'bn' ? 'সক্রিয়' : 'Active'}</td>
                      <td className="py-2 text-right font-medium">{data.tickets.active}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {language === 'bn' ? 'খাবার বিক্রয়' : 'Food Sales'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</td>
                      <td className="py-2 text-right font-medium">{data.food.completedOrders}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'মোট আয়' : 'Total Revenue'}</td>
                      <td className="py-2 text-right font-medium">৳{data.food.totalRevenue.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">{language === 'bn' ? 'নগদ' : 'Cash'}</td>
                      <td className="py-2 text-right font-medium">৳{data.food.cashRevenue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2">{language === 'bn' ? 'অনলাইন' : 'Online'}</td>
                      <td className="py-2 text-right font-medium">৳{data.food.onlineRevenue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Top Food Items */}
          {data.food.topItems.length > 0 && (
            <Card className="mb-6 print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {language === 'bn' ? 'সেরা বিক্রিত আইটেম' : 'Top Selling Items'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">{language === 'bn' ? 'আইটেম' : 'Item'}</th>
                      <th className="py-2 text-center">{language === 'bn' ? 'বিক্রয়' : 'Sold'}</th>
                      <th className="py-2 text-right">{language === 'bn' ? 'আয়' : 'Revenue'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.food.topItems.slice(0, 5).map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2">{language === 'bn' ? item.name_bn : item.name}</td>
                        <td className="py-2 text-center">{item.count}</td>
                        <td className="py-2 text-right">৳{item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Payment Breakdown */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {language === 'bn' ? 'পেমেন্ট সারাংশ' : 'Payment Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-bold">৳{data.revenue.cashRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'নগদ পেমেন্ট' : 'Cash Payments'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-bold">৳{data.revenue.onlineRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'অনলাইন পেমেন্ট' : 'Online Payments'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>Baby World Indoor Playground • {language === 'bn' ? 'এই রিপোর্ট স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে' : 'This report was automatically generated'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
