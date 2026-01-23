import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  FileBarChart, 
  Download, 
  TrendingUp, 
  Calendar,
  Users,
  Banknote,
  PartyPopper,
  FileText
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, parseISO } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function AdminReports() {
  const { language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [activeTab, setActiveTab] = useState('overview');

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: language === 'bn' ? bn : undefined })
      });
    }
    return options;
  }, [language]);

  // Parse selected month
  const { startDate, endDate } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    return {
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd')
    };
  }, [selectedMonth]);

  // Fetch bookings for the selected month
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['report-bookings', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('slot_date', startDate)
        .lte('slot_date', endDate);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch payments for the selected month
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['report-payments', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch tickets for the selected month
  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['report-tickets', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .gte('slot_date', startDate)
        .lte('slot_date', endDate);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = loadingBookings || loadingPayments || loadingTickets;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = payments?.reduce((sum, p) => p.status === 'completed' ? sum + Number(p.amount) : sum, 0) || 0;
    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
    const eventBookings = bookings?.filter(b => b.booking_type !== 'hourly_play').length || 0;
    const hourlyBookings = bookings?.filter(b => b.booking_type === 'hourly_play').length || 0;
    const totalTickets = tickets?.length || 0;
    const usedTickets = tickets?.filter(t => t.status === 'used').length || 0;

    return {
      totalRevenue,
      totalBookings,
      confirmedBookings,
      eventBookings,
      hourlyBookings,
      totalTickets,
      usedTickets,
      conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
    };
  }, [bookings, payments, tickets]);

  // Daily revenue data for chart
  const dailyRevenueData = useMemo(() => {
    if (!payments) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1))
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRevenue = payments
        .filter(p => p.status === 'completed' && p.created_at.startsWith(dayStr))
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        date: format(day, 'd'),
        revenue: dayRevenue
      };
    });
  }, [payments, selectedMonth]);

  // Booking type distribution
  const bookingTypeData = useMemo(() => {
    if (!bookings) return [];
    const hourly = bookings.filter(b => b.booking_type === 'hourly_play').length;
    const birthday = bookings.filter(b => b.booking_type === 'birthday_event').length;
    const privateEvent = bookings.filter(b => b.booking_type === 'private_event').length;

    return [
      { name: language === 'bn' ? 'আওয়ারলি প্লে' : 'Hourly Play', value: hourly },
      { name: language === 'bn' ? 'বার্থডে পার্টি' : 'Birthday Party', value: birthday },
      { name: language === 'bn' ? 'প্রাইভেট ইভেন্ট' : 'Private Event', value: privateEvent }
    ].filter(d => d.value > 0);
  }, [bookings, language]);

  // Daily bookings data
  const dailyBookingsData = useMemo(() => {
    if (!bookings) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1))
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayBookings = bookings.filter(b => b.slot_date === dayStr).length;
      return {
        date: format(day, 'd'),
        bookings: dayBookings
      };
    });
  }, [bookings, selectedMonth]);

  // Export to CSV
  const exportToCSV = (type: 'bookings' | 'payments' | 'summary') => {
    let csvContent = '';
    let filename = '';

    if (type === 'bookings') {
      csvContent = 'Date,Parent Name,Phone,Type,Status,Payment Status\n';
      bookings?.forEach(b => {
        csvContent += `${b.slot_date},"${b.parent_name}",${b.parent_phone},${b.booking_type},${b.status},${b.payment_status}\n`;
      });
      filename = `bookings-${selectedMonth}.csv`;
    } else if (type === 'payments') {
      csvContent = 'Date,Amount,Status,Method,Transaction ID\n';
      payments?.forEach(p => {
        csvContent += `${format(parseISO(p.created_at), 'yyyy-MM-dd')},${p.amount},${p.status},${p.payment_method || 'N/A'},${p.transaction_id || 'N/A'}\n`;
      });
      filename = `payments-${selectedMonth}.csv`;
    } else {
      csvContent = 'Metric,Value\n';
      csvContent += `Total Revenue,${stats.totalRevenue}\n`;
      csvContent += `Total Bookings,${stats.totalBookings}\n`;
      csvContent += `Confirmed Bookings,${stats.confirmedBookings}\n`;
      csvContent += `Event Bookings,${stats.eventBookings}\n`;
      csvContent += `Hourly Bookings,${stats.hourlyBookings}\n`;
      csvContent += `Total Tickets,${stats.totalTickets}\n`;
      csvContent += `Used Tickets,${stats.usedTickets}\n`;
      filename = `summary-${selectedMonth}.csv`;
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
            {language === 'bn' ? 'রিপোর্ট' : 'Reports'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'বিস্তারিত বিশ্লেষণ ও রিপোর্ট' : 'Detailed analytics and reports'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-xl font-bold">৳{stats.totalRevenue.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Calendar className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{stats.totalBookings}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <PartyPopper className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'ইভেন্ট বুকিং' : 'Event Bookings'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{stats.eventBookings}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <TrendingUp className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'কনভার্সন রেট' : 'Conversion Rate'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{stats.conversionRate}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            {language === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="revenue">
            {language === 'bn' ? 'আয়' : 'Revenue'}
          </TabsTrigger>
          <TabsTrigger value="bookings">
            {language === 'bn' ? 'বুকিং' : 'Bookings'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{language === 'bn' ? 'দৈনিক আয়' : 'Daily Revenue'}</CardTitle>
                  <CardDescription>{language === 'bn' ? 'এই মাসের দৈনিক আয়' : 'Daily revenue this month'}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCSV('payments')}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, language === 'bn' ? 'আয়' : 'Revenue']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Booking Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'বুকিং টাইপ' : 'Booking Types'}</CardTitle>
                <CardDescription>{language === 'bn' ? 'বুকিং টাইপ অনুযায়ী বিভাজন' : 'Distribution by booking type'}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : bookingTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={bookingTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {language === 'bn' ? 'রিপোর্ট এক্সপোর্ট' : 'Export Reports'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'CSV ফরম্যাটে রিপোর্ট ডাউনলোড করুন' : 'Download reports in CSV format'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => exportToCSV('summary')}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'সারসংক্ষেপ রিপোর্ট' : 'Summary Report'}
                </Button>
                <Button variant="outline" onClick={() => exportToCSV('bookings')}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'বুকিং রিপোর্ট' : 'Bookings Report'}
                </Button>
                <Button variant="outline" onClick={() => exportToCSV('payments')}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'পেমেন্ট রিপোর্ট' : 'Payments Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'bn' ? 'আয়ের ট্রেন্ড' : 'Revenue Trend'}</CardTitle>
                <CardDescription>{language === 'bn' ? 'দৈনিক আয়ের গ্রাফ' : 'Daily revenue graph'}</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                ৳{stats.totalRevenue.toLocaleString()}
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`৳${value.toLocaleString()}`, language === 'bn' ? 'আয়' : 'Revenue']}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'bn' ? 'দৈনিক বুকিং' : 'Daily Bookings'}</CardTitle>
                <CardDescription>{language === 'bn' ? 'প্রতিদিনের বুকিং সংখ্যা' : 'Number of bookings per day'}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.confirmedBookings} {language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</Badge>
                <Badge variant="outline">{stats.totalBookings} {language === 'bn' ? 'মোট' : 'Total'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dailyBookingsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: number) => [value, language === 'bn' ? 'বুকিং' : 'Bookings']}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="bookings" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
