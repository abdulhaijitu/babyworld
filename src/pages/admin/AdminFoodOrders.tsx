import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UtensilsCrossed,
  RefreshCw,
  Loader2,
  Search,
  ShoppingCart,
  Check,
  X,
  Eye,
  Filter,
  Calendar,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { printFoodReceipt } from '@/lib/printFoodReceipt';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';

interface FoodItem {
  id: string;
  name: string;
  name_bn: string | null;
  category: 'snacks' | 'drinks' | 'meals';
  price: number;
  is_available: boolean;
}

interface FoodOrder {
  id: string;
  order_number: string;
  ticket_id: string | null;
  customer_name: string | null;
  status: 'pending' | 'served' | 'cancelled';
  payment_type: 'cash' | 'online' | 'pending';
  subtotal: number;
  total: number;
  discount_amount: number;
  discount_type: string | null;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
}

interface FoodOrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  food_items?: {
    name: string;
    category: string;
  };
}

export default function AdminFoodOrders() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Order detail dialog
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [orderItems, setOrderItems] = useState<FoodOrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const getDateRange = useCallback((filter: string) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case 'week':
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case 'month':
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
      default:
        return null;
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('food_orders')
        .select('*')
        .order('created_at', { ascending: false });

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      } else {
        query = query.limit(200);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'served' | 'cancelled');
      }

      if (paymentFilter !== 'all') {
        query = query.eq('payment_type', paymentFilter as 'cash' | 'online' | 'pending');
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders((data || []) as FoodOrder[]);
    } catch (err) {
      console.error('[FoodOrders] fetch error:', err);
      toast.error('অর্ডার লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, paymentFilter, getDateRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, status: 'served' | 'cancelled') => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('food_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(status === 'served' ? 'সার্ভ সম্পন্ন' : 'অর্ডার বাতিল');
    } catch (err) {
      toast.error('আপডেট ব্যর্থ');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrintOrder = async (order: FoodOrder) => {
    try {
      const { data: items, error } = await supabase
        .from('food_order_items')
        .select('*, food_items(name, price)')
        .eq('order_id', order.id);
      if (error) throw error;

      printFoodReceipt({
        orderNumber: order.order_number,
        items: (items || []).map((item: any) => ({
          name: item.food_items?.name || 'Unknown',
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        total: order.total,
        customerName: order.customer_name,
        paymentType: order.payment_type,
        createdAt: new Date(order.created_at),
        isReprint: true,
      });
    } catch (err) {
      toast.error('রিসিপ্ট প্রিন্ট ব্যর্থ');
    }
  };

  const handleViewOrder = async (order: FoodOrder) => {
    setSelectedOrder(order);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_order_items')
        .select('*, food_items(name, category)')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems((data || []) as FoodOrderItem[]);
    } catch (err) {
      console.error('[FoodOrders] detail error:', err);
      toast.error('আইটেম লোড ব্যর্থ');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">Pending</Badge>;
      case 'served':
        return <Badge className="bg-green-500/10 text-green-600 border-green-300">Served</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (type: string) => {
    switch (type) {
      case 'cash':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Cash</Badge>;
      case 'online':
        return <Badge variant="outline" className="text-purple-600 border-purple-300">Online</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Pending</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q))
    );
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const servedCount = orders.filter(o => o.status === 'served').length;
  const totalRevenue = orders
    .filter(o => o.status === 'served')
    .reduce((sum, o) => sum + o.total, 0);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'snacks': return 'Snacks';
      case 'drinks': return 'Drinks';
      case 'meals': return 'Meals';
      default: return cat;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Food Orders
          </h1>
          <p className="text-muted-foreground">অর্ডার ম্যানেজমেন্ট ও ট্র্যাকিং</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Served</CardDescription>
            <CardTitle className="text-2xl text-green-600">{servedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue (Served)</CardDescription>
            <CardTitle className="text-2xl">৳{totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="অর্ডার নম্বর বা কাস্টমার সার্চ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Discount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      কোনো অর্ডার পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.customer_name || '—'}</TableCell>
                      <TableCell className="font-semibold">৳{order.total}</TableCell>
                      <TableCell>{getPaymentBadge(order.payment_type)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'hh:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewOrder(order)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePrintOrder(order)}
                            title="Print receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(order.id, 'served')}
                                disabled={updatingId === order.id}
                                title="Mark as served"
                              >
                                {updatingId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                disabled={updatingId === order.id}
                                title="Cancel order"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Order {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer</span>
                  <p className="font-medium">{selectedOrder.customer_name || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>{getStatusBadge(selectedOrder.status)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment</span>
                  <p>{getPaymentBadge(selectedOrder.payment_type)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time</span>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Items</h4>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items found</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.food_items?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                        </div>
                        <span className="font-medium">৳{item.total_price}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>৳{selectedOrder.total}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-3">
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'served');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'served' } : null);
                    }}
                    disabled={updatingId === selectedOrder.id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Serve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'cancelled');
                      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                    }}
                    disabled={updatingId === selectedOrder.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
