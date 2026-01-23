import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileBarChart, 
  Download, 
  Calendar as CalendarIcon,
  RefreshCw,
  Ticket,
  UtensilsCrossed,
  TrendingUp
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReportsSummary } from '@/hooks/useReportsSummary';
import { ReportsSummaryCards } from '@/components/admin/reports/ReportsSummaryCards';
import { TicketSalesReport } from '@/components/admin/reports/TicketSalesReport';
import { FoodSalesReport } from '@/components/admin/reports/FoodSalesReport';
import { RevenueReport } from '@/components/admin/reports/RevenueReport';
import { cn } from '@/lib/utils';

type DateRangeType = 'today' | 'week' | 'month' | 'custom';

export default function AdminReports() {
  const { language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, refetch, isFetching } = useReportsSummary(
    dateRange,
    customStart ? format(customStart, 'yyyy-MM-dd') : undefined,
    customEnd ? format(customEnd, 'yyyy-MM-dd') : undefined
  );

  const dateRangeOptions = [
    { value: 'today', label: language === 'bn' ? 'আজ' : 'Today' },
    { value: 'week', label: language === 'bn' ? 'এই সপ্তাহ' : 'This Week' },
    { value: 'month', label: language === 'bn' ? 'এই মাস' : 'This Month' },
    { value: 'custom', label: language === 'bn' ? 'কাস্টম' : 'Custom' },
  ];

  const exportToCSV = (type: 'tickets' | 'food' | 'revenue' | 'summary') => {
    if (!data) return;
    
    let csvContent = '';
    let filename = '';
    const period = `${data.period.start_date}_to_${data.period.end_date}`;

    if (type === 'summary') {
      csvContent = 'Metric,Value\n';
      csvContent += `Total Revenue,${data.revenue.combinedRevenue}\n`;
      csvContent += `Ticket Revenue,${data.revenue.totalTicketRevenue}\n`;
      csvContent += `Food Revenue,${data.revenue.totalFoodRevenue}\n`;
      csvContent += `Total Tickets,${data.tickets.total}\n`;
      csvContent += `Total Food Orders,${data.food.completedOrders}\n`;
      csvContent += `Online Revenue,${data.revenue.onlineRevenue}\n`;
      csvContent += `Cash Revenue,${data.revenue.cashRevenue}\n`;
      filename = `summary-${period}.csv`;
    } else if (type === 'tickets') {
      csvContent = 'Date,Tickets,Revenue\n';
      data.dailyBreakdown.forEach(day => {
        csvContent += `${day.date},${day.tickets},${day.ticketRevenue}\n`;
      });
      filename = `ticket-sales-${period}.csv`;
    } else if (type === 'food') {
      csvContent = 'Item,Category,Quantity,Revenue\n';
      data.food.topItems.forEach(item => {
        csvContent += `"${item.name}",${item.category},${item.count},${item.revenue}\n`;
      });
      filename = `food-sales-${period}.csv`;
    } else {
      csvContent = 'Date,Ticket Revenue,Food Revenue,Total Revenue\n';
      data.dailyBreakdown.forEach(day => {
        csvContent += `${day.date},${day.ticketRevenue},${day.foodRevenue},${day.totalRevenue}\n`;
      });
      filename = `revenue-${period}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="w-6 h-6" />
            {language === 'bn' ? 'সেলস ও রেভিনিউ রিপোর্ট' : 'Sales & Revenue Reports'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'বিস্তারিত বিশ্লেষণ ও সারাংশ' : 'Detailed analytics and summaries'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeType)}>
            <SelectTrigger className="w-[140px]">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!customStart && "text-muted-foreground")}>
                    {customStart ? format(customStart, 'PP', { locale: language === 'bn' ? bn : undefined }) : 
                      (language === 'bn' ? 'শুরু' : 'Start')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customStart} onSelect={setCustomStart} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!customEnd && "text-muted-foreground")}>
                    {customEnd ? format(customEnd, 'PP', { locale: language === 'bn' ? bn : undefined }) : 
                      (language === 'bn' ? 'শেষ' : 'End')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customEnd} onSelect={setCustomEnd} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <ReportsSummaryCards data={data} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4 hidden sm:inline" />
              {language === 'bn' ? 'সারাংশ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="w-4 h-4 hidden sm:inline" />
              {language === 'bn' ? 'টিকেট' : 'Tickets'}
            </TabsTrigger>
            <TabsTrigger value="food" className="gap-2">
              <UtensilsCrossed className="w-4 h-4 hidden sm:inline" />
              {language === 'bn' ? 'খাবার' : 'Food'}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <FileBarChart className="w-4 h-4 hidden sm:inline" />
              {language === 'bn' ? 'আয়' : 'Revenue'}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV('summary')}
              disabled={!data}
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'এক্সপোর্ট' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <RevenueReport data={data} isLoading={isLoading} />
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV('tickets')}
              disabled={!data}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
          <TicketSalesReport data={data} isLoading={isLoading} />
        </TabsContent>

        {/* Food Tab */}
        <TabsContent value="food" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV('food')}
              disabled={!data}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
          <FoodSalesReport data={data} isLoading={isLoading} />
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV('revenue')}
              disabled={!data}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
          <RevenueReport data={data} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!isLoading && !data?.revenue.combinedRevenue && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileBarChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'bn' ? 'কোনো ডাটা নেই' : 'No Data Yet'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === 'bn' 
                ? 'এই সময়ের জন্য কোনো বিক্রয় ডাটা পাওয়া যায়নি।'
                : 'No sales data found for this period.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
