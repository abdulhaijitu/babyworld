import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UtensilsCrossed, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';

interface FoodSalesReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function FoodSalesReport({ data, isLoading }: FoodSalesReportProps) {

  const categoryLabels: Record<string, { en: string; bn: string }> = {
    snacks: { en: 'Snacks', bn: 'স্ন্যাকস' },
    drinks: { en: 'Drinks', bn: 'পানীয়' },
    meals: { en: 'Meals', bn: 'খাবার' },
    desserts: { en: 'Desserts', bn: 'মিষ্টি' },
    combos: { en: 'Combos', bn: 'কম্বো' },
  };

  const categoryData = data?.food.categoryBreakdown.map((cat) => ({
    name: categoryLabels[cat.category]?.['en'] || cat.category,
    value: cat.revenue,
    count: cat.count,
  })) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-primary" />
            <p className="text-lg sm:text-2xl font-bold">৳{(data?.food.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Total Revenue'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-chart-2" />
            <p className="text-lg sm:text-2xl font-bold">{data?.food.completedOrders || 0}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Orders'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-green-600" />
            <p className="text-lg sm:text-2xl font-bold">৳{(data?.food.cashRevenue || 0).toLocaleString()}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Cash'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-chart-4" />
            <p className="text-lg sm:text-2xl font-bold">৳{(data?.food.onlineRevenue || 0).toLocaleString()}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {'Online'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'By Category'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'Sales by food category'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                {'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'Top Selling'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'Best selling items'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {data?.food.topItems && data.food.topItems.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 max-h-[220px] sm:max-h-[250px] overflow-y-auto">
                {data.food.topItems.slice(0, 5).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-base truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {item.count} {'sold'}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-xs sm:text-base whitespace-nowrap ml-2">৳{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                {'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Item List - Desktop Table */}
      {data?.food.topItems && data.food.topItems.length > 0 && (
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm sm:text-base">{'All Items'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {'Detailed item sales'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {/* Desktop table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{'Item'}</TableHead>
                    <TableHead>{'Category'}</TableHead>
                    <TableHead className="text-center">{'Sold'}</TableHead>
                    <TableHead className="text-right">{'Revenue'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.food.topItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[item.category]?.['en'] || item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        ৳{item.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile card view */}
            <div className="lg:hidden space-y-2">
              {data.food.topItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {categoryLabels[item.category]?.['en'] || item.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{item.count} sold</span>
                    </div>
                  </div>
                  <p className="font-bold text-xs whitespace-nowrap ml-2">৳{item.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
