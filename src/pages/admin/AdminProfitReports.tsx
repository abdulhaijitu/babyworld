import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

import { 
  TrendingUp, 
  TrendingDown, 
  CalendarIcon, 
  DollarSign,
  Receipt,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Download,
  Printer
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-blue-100': '#3b82f6',
  'bg-purple-100': '#8b5cf6',
  'bg-yellow-100': '#eab308',
  'bg-orange-100': '#f97316',
  'bg-pink-100': '#ec4899',
  'bg-gray-100': '#6b7280',
  'bg-green-100': '#22c55e',
  'bg-slate-100': '#64748b',
  'bg-red-100': '#ef4444',
  'bg-teal-100': '#14b8a6',
};

function getHexFromColor(colorClass: string): string {
  const bgClass = colorClass.split(' ')[0];
  return TAILWIND_COLOR_MAP[bgClass] || '#64748b';
}

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#6b7280', '#64748b'];

export default function AdminProfitReports() {
  const { data: dbCategories = [] } = useExpenseCategories();

  // Build dynamic label map from DB categories
  const categoryLabels: Record<string, { en: string; color: string }> = {};
  dbCategories.forEach(c => {
    categoryLabels[c.name] = { en: c.label, color: getHexFromColor(c.color) };
  });

  // Date range state
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState('overview');

  // Quick date presets
  const setThisMonth = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
  };

  const setThisWeek = () => {
    setStartDate(startOfWeek(new Date(), { weekStartsOn: 6 }));
    setEndDate(endOfWeek(new Date(), { weekStartsOn: 6 }));
  };

  const setLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    setStartDate(startOfMonth(lastMonth));
    setEndDate(endOfMonth(lastMonth));
  };

  // Fetch profit summary
  const { data: profitData, isLoading } = useQuery({
    queryKey: ['profit-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-profit-summary', {
        body: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd')
        }
      });
      if (error) throw error;
      return data;
    }
  });

  const summary = profitData?.summary || {
    totalRevenue: 0,
    totalTicketRevenue: 0,
    totalFoodRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    isProfit: true
  };

  const expenseBreakdown = profitData?.expenseBreakdown || [];
  const dailyBreakdown = profitData?.dailyBreakdown || [];

  // Prepare chart data
  const profitTrendData = dailyBreakdown.map((d: { date: string; ticketRevenue: number; foodRevenue: number; expenses: number; profit: number }) => ({
    date: format(new Date(d.date), 'dd MMM'),
    revenue: d.ticketRevenue + d.foodRevenue,
    expenses: d.expenses,
    profit: d.profit
  }));

  const revenueVsExpenseData = [
    { name: 'Revenue', value: summary.totalRevenue, fill: '#22c55e' },
    { name: 'Expenses', value: summary.totalExpenses, fill: '#ef4444' }
  ];

  const expensePieData = expenseBreakdown.map((e: { category: string; amount: number }) => ({
    name: categoryLabels[e.category]?.en || e.category,
    value: e.amount,
    fill: categoryLabels[e.category]?.color || '#64748b'
  }));

  // Export to CSV
  const exportToCSV = () => {
    if (!profitData) return;
    
    const headers = ['Date', 'Ticket Revenue', 'Food Revenue', 'Total Revenue', 'Expenses', 'Profit/Loss'];
    const rows = dailyBreakdown.map((d: { date: string; ticketRevenue: number; foodRevenue: number; expenses: number; profit: number }) => [
      d.date,
      d.ticketRevenue,
      d.foodRevenue,
      d.ticketRevenue + d.foodRevenue,
      d.expenses,
      d.profit
    ]);
    
    // Add summary row
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Revenue', summary.totalRevenue]);
    rows.push(['Total Expenses', summary.totalExpenses]);
    rows.push(['Net Profit/Loss', summary.netProfit]);
    rows.push(['Profit Margin', `${summary.profitMargin}%`]);
    
    // Add expense breakdown
    rows.push([]);
    rows.push(['EXPENSE BREAKDOWN']);
    expenseBreakdown.forEach((e: { category: string; amount: number; percentage: number }) => {
      rows.push([categoryLabels[e.category]?.en || e.category, e.amount, `${e.percentage}%`]);
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profit-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 print:hidden" />
            {'Profit & Loss Report'}
          </h1>
          <p className="text-muted-foreground">
            {'Revenue, expenses and net profit analysis'}
          </p>
          <p className="text-sm text-muted-foreground print:block hidden">
            {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
          </p>
        </div>

        {/* Date Range & Export Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={setThisWeek}>
            {'This Week'}
          </Button>
          <Button variant="outline" size="sm" onClick={setThisMonth}>
            {'This Month'}
          </Button>
          <Button variant="outline" size="sm" onClick={setLastMonth}>
            {'Last Month'}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: startDate, to: endDate }}
                onSelect={(range) => {
                  if (range?.from) setStartDate(range.from);
                  if (range?.to) setEndDate(range.to);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {/* Export Buttons */}
          <div className="flex gap-1 ml-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!profitData}>
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              {'Print'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {'Total Revenue'}
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">৳{summary.totalRevenue.toLocaleString()}</div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>টিকেট: ৳{summary.totalTicketRevenue.toLocaleString()}</span>
                <span>ফুড: ৳{summary.totalFoodRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {'Total Expenses'}
              </CardTitle>
              <Receipt className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">৳{summary.totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-2">
                {expenseBreakdown[0] && (
                  <span>
                    {'Top:'} {categoryLabels[expenseBreakdown[0].category]?.en || expenseBreakdown[0].category}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className={summary.isProfit ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {'Net Profit/Loss'}
              </CardTitle>
              {summary.isProfit ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {summary.isProfit ? '+' : ''}৳{summary.netProfit.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {summary.isProfit ? (
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                )}
                <span className={summary.isProfit ? 'text-green-600' : 'text-red-600'}>
                  {summary.profitMargin}% {'margin'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Visual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {'Profit Ratio'}
              </CardTitle>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{'Revenue'}</span>
                  <span className="text-primary font-medium">৳{summary.totalRevenue.toLocaleString()}</span>
                </div>
                <Progress 
                  value={summary.totalRevenue > 0 ? 100 : 0} 
                  className="h-2"
                />
                <div className="flex justify-between text-sm">
                  <span>{'Expenses'}</span>
                  <span className="text-destructive font-medium">৳{summary.totalExpenses.toLocaleString()}</span>
                </div>
                <Progress 
                  value={summary.totalRevenue > 0 ? (summary.totalExpenses / summary.totalRevenue) * 100 : 0} 
                  className="h-2 [&>div]:bg-destructive"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{'Overview'}</TabsTrigger>
          <TabsTrigger value="trend">{'Trend'}</TabsTrigger>
          <TabsTrigger value="expenses">{'Expense Analysis'}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expense Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{'Revenue vs Expenses'}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueVsExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, '']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {revenueVsExpenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Expense Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{'Expense Categories'}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : expensePieData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {'No expenses recorded'}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {expensePieData.map((entry: { fill: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trend Tab */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>{'Daily Profit Trend'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : profitTrendData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {'No data available'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={profitTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `৳${value.toLocaleString()}`, 
                        name === 'revenue' ? ('Revenue') :
                        name === 'expenses' ? ('Expenses') :
                        ('Profit')
                      ]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                      name={'Revenue'}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      name={'Expenses'}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.5}
                      name={'Profit'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Analysis Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{'Detailed Expense Analysis'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : expenseBreakdown.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{'No expense records'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseBreakdown.map((expense: { category: string; amount: number; percentage: number }, index: number) => {
                    const catInfo = EXPENSE_CATEGORY_LABELS[expense.category];
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: catInfo?.color || '#64748b' }}
                            />
                            <span className="font-medium">
                              {catInfo?.en || expense.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">৳{expense.amount.toLocaleString()}</span>
                            <span className="text-muted-foreground ml-2">({expense.percentage}%)</span>
                          </div>
                        </div>
                        <Progress 
                          value={expense.percentage} 
                          className="h-2"
                          style={{ 
                            '--progress-background': catInfo?.color || '#64748b' 
                          } as React.CSSProperties}
                        />
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="pt-4 border-t flex justify-between items-center font-bold">
                    <span>{'Total Expenses'}</span>
                    <span className="text-destructive text-lg">৳{summary.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{'Daily Revenue & Expenses'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`৳${value.toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#22c55e" 
                      name={'Revenue'}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="expenses" 
                      fill="#ef4444" 
                      name={'Expenses'}
                      radius={[4, 4, 0, 0]}
                    />
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
