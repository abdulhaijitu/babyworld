import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UtensilsCrossed, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ReportsSummary } from '@/hooks/useReportsSummary';

interface FoodSalesReportProps {
  data: ReportsSummary | undefined;
  isLoading: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function FoodSalesReport({ data, isLoading }: FoodSalesReportProps) {
  const { language } = useLanguage();

  const categoryLabels: Record<string, { en: string; bn: string }> = {
    snacks: { en: 'Snacks', bn: 'স্ন্যাকস' },
    drinks: { en: 'Drinks', bn: 'পানীয়' },
    meals: { en: 'Meals', bn: 'খাবার' },
    desserts: { en: 'Desserts', bn: 'মিষ্টি' },
    combos: { en: 'Combos', bn: 'কম্বো' },
  };

  const categoryData = data?.food.categoryBreakdown.map((cat, index) => ({
    name: categoryLabels[cat.category]?.[language === 'bn' ? 'bn' : 'en'] || cat.category,
    value: cat.revenue,
    count: cat.count,
  })) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">৳{(data?.food.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-chart-2" />
            <p className="text-2xl font-bold">{data?.food.completedOrders || 0}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'সম্পন্ন অর্ডার' : 'Orders'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">৳{(data?.food.cashRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'নগদ' : 'Cash'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-chart-4" />
            <p className="text-2xl font-bold">৳{(data?.food.onlineRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? 'অনলাইন' : 'Online'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'ক্যাটাগরি অনুযায়ী' : 'By Category'}</CardTitle>
            <CardDescription>
              {language === 'bn' ? 'খাবারের ধরন অনুযায়ী বিক্রয়' : 'Sales by food category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, language === 'bn' ? 'আয়' : 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'সেরা বিক্রিত' : 'Top Selling'}</CardTitle>
            <CardDescription>
              {language === 'bn' ? 'সবচেয়ে বেশি বিক্রিত আইটেম' : 'Best selling items'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.food.topItems && data.food.topItems.length > 0 ? (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {data.food.topItems.slice(0, 5).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {language === 'bn' ? item.name_bn : item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} {language === 'bn' ? 'টি বিক্রি' : 'sold'}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">৳{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {language === 'bn' ? 'কোনো ডাটা নেই' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Item List */}
      {data?.food.topItems && data.food.topItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'সকল আইটেম' : 'All Items'}</CardTitle>
            <CardDescription>
              {language === 'bn' ? 'বিস্তারিত আইটেম বিক্রয়' : 'Detailed item sales'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'আইটেম' : 'Item'}</TableHead>
                  <TableHead>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</TableHead>
                  <TableHead className="text-center">{language === 'bn' ? 'বিক্রয়' : 'Sold'}</TableHead>
                  <TableHead className="text-right">{language === 'bn' ? 'আয়' : 'Revenue'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.food.topItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {language === 'bn' ? item.name_bn : item.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[item.category]?.[language === 'bn' ? 'bn' : 'en'] || item.category}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
