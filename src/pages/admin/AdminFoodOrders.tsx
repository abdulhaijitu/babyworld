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
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
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

  const fetchFoodItems = useCallback(async () => {
    setFoodItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setFoodItems((data || []) as FoodItem[]);
    } catch (err) {
      console.error('[FoodOrders] items error:', err);
    } finally {
      setFoodItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenNewOrder = () => {
    setNewOrderOpen(true);
    setCart([]);
    setCustomerName('');
    setPaymentType('cash');
    setOrderNotes('');
    setItemSearch('');
    if (foodItems.length === 0) {
      fetchFoodItems();
    }
  };

  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) {
        return prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(c => c.itemId === itemId ? { ...c, quantity: c.quantity + delta } : c)
        .filter(c => c.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.itemId !== itemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const generateOrderNumber = () => {
    const prefix = 'FO';
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${date}${random}`;
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error('অন্তত একটি আইটেম সিলেক্ট করুন');
      return;
    }

    setCreatingOrder(true);
    try {
      const orderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('food_orders')
        .insert([{
          order_number: orderNumber,
          customer_name: customerName || null,
          status: 'pending' as const,
          payment_type: paymentType,
          subtotal: cartTotal,
          total: cartTotal,
          notes: orderNotes || null,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = cart.map(c => ({
        order_id: orderData.id,
        food_item_id: c.itemId,
        quantity: c.quantity,
        unit_price: c.price,
        total_price: c.price * c.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('food_order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      toast.success(`অর্ডার তৈরি হয়েছে: ${orderNumber}`);
      setNewOrderOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('[FoodOrders] create error:', err);
      toast.error('অর্ডার তৈরি ব্যর্থ');
    } finally {
      setCreatingOrder(false);
    }
  };

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

  const filteredFoodItems = foodItems.filter(i => {
    if (!itemSearch) return true;
    return i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (i.name_bn && i.name_bn.includes(itemSearch));
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
          <Button size="sm" onClick={handleOpenNewOrder}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
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

      {/* New Order Dialog */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Food Order
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* Customer & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Customer Name</Label>
                <Input
                  placeholder="ঐচ্ছিক"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Payment</Label>
                <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'cash' | 'pending')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Selection with Category Tabs */}
            <div className="space-y-2">
              <Label className="text-sm">Add Items</Label>
              {foodItemsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Tabs defaultValue="snacks">
                  <TabsList className="w-full">
                    <TabsTrigger value="snacks" className="flex-1">Snacks ({foodItems.filter(i => i.category === 'snacks').length})</TabsTrigger>
                    <TabsTrigger value="drinks" className="flex-1">Drinks ({foodItems.filter(i => i.category === 'drinks').length})</TabsTrigger>
                    <TabsTrigger value="meals" className="flex-1">Meals ({foodItems.filter(i => i.category === 'meals').length})</TabsTrigger>
                  </TabsList>
                  {(['snacks', 'drinks', 'meals'] as const).map((cat) => (
                    <TabsContent key={cat} value={cat} className="mt-2">
                      <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto border rounded-lg p-2">
                        {foodItems.filter(i => i.category === cat).length === 0 ? (
                          <p className="col-span-2 text-center text-sm text-muted-foreground py-3">কোনো আইটেম নেই</p>
                        ) : (
                          foodItems.filter(i => i.category === cat).map((item) => {
                            const inCart = cart.find(c => c.itemId === item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="flex items-center justify-between p-2 rounded-md border text-left text-sm hover:bg-muted transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">৳{item.price}</p>
                                </div>
                                {inCart && (
                                  <Badge variant="secondary" className="ml-1 shrink-0">{inCart.quantity}</Badge>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Cart ({cart.length} items)</Label>
                <div className="border rounded-lg divide-y">
                  {cart.map((c) => (
                    <div key={c.itemId} className="flex items-center justify-between p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">৳{c.price} × {c.quantity} = ৳{c.price * c.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateCartQty(c.itemId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{c.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateCartQty(c.itemId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(c.itemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm">Notes (ঐচ্ছিক)</Label>
              <Input
                placeholder="অর্ডার সম্পর্কে নোট..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <div className="flex items-center justify-between w-full">
              <div className="text-lg font-bold">
                Total: ৳{cartTotal}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setNewOrderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder} disabled={creatingOrder || cart.length === 0}>
                  {creatingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Order
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
