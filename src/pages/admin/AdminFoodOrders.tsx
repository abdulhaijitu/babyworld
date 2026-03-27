import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminFoodOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Food Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Food orders management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFoodOrders;
