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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  UtensilsCrossed, 
  Coffee, 
  Sandwich,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  ShoppingCart,
  Check,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';

interface FoodItem {
  id: string;
  name: string;
  name_bn: string | null;
  category: 'snacks' | 'drinks' | 'meals';
  price: number;
  is_available: boolean;
  image_url: string | null;
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

export default function AdminFoodSales() {
  const [activeTab, setActiveTab] = useState('items');
  
  // Food Items state
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    name_bn: '',
    category: 'snacks' as 'snacks' | 'drinks' | 'meals',
    price: 0,
    is_available: true
  });

  // Orders state
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderItems, setOrderItems] = useState<{itemId: string; quantity: number}[]>([]);
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderPaymentType, setOrderPaymentType] = useState<'cash' | 'pending'>('cash');

  const fetchFoodItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setFoodItems((data || []) as FoodItem[]);
    } catch (err) {
      console.error('[Food] Items error:', err);
      toast.error('Failed to load items');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data || []) as FoodOrder[]);
    } catch (err) {
      console.error('[Food] Orders error:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoodItems();
    fetchOrders();
  }, [fetchFoodItems, fetchOrders]);

  const handleSaveItem = async () => {
    if (!newItem.name || newItem.price <= 0) {
      toast.error('Name and price required');
      return;
    }

    setSavingItem(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('food_items')
          .update({
            name: newItem.name,
            name_bn: newItem.name_bn || null,
            category: newItem.category,
            price: newItem.price,
            is_available: newItem.is_available
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item updated');
      } else {
        const { error } = await supabase
          .from('food_items')
          .insert([{
            name: newItem.name,
            name_bn: newItem.name_bn || null,
            category: newItem.category,
            price: newItem.price,
            is_available: newItem.is_available
          }]);

        if (error) throw error;
        toast.success('Item added');
      }

      setItemDialogOpen(false);
      setEditingItem(null);
      setNewItem({ name: '', name_bn: '', category: 'snacks', price: 0, is_available: true });
      fetchFoodItems();
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('food_items').delete().eq('id', id);
      if (error) throw error;
      toast.success('Item deleted');
      setFoodItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ is_available: available })
        .eq('id', id);

      if (error) throw error;
      setFoodItems(prev => prev.map(i => i.id === id ? {...i, is_available: available} : i));
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const openEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      name_bn: item.name_bn || '',
      category: item.category,
      price: item.price,
      is_available: item.is_available
    });
    setItemDialogOpen(true);
  };

  const generateOrderNumber = () => {
    const prefix = 'FO';
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${date}${random}`;
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Select items');
      return;
    }

    setCreatingOrder(true);
    try {
      const total = orderItems.reduce((sum, oi) => {
        const item = foodItems.find(f => f.id === oi.itemId);
        return sum + (item?.price || 0) * oi.quantity;
      }, 0);

      const orderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('food_orders')
        .insert([{
          order_number: orderNumber,
          customer_name: orderCustomer || null,
          status: 'pending',
          payment_type: orderPaymentType,
          subtotal: total,
          total: total
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItemsData = orderItems.map(oi => {
        const item = foodItems.find(f => f.id === oi.itemId)!;
        return {
          order_id: orderData.id,
          food_item_id: oi.itemId,
          quantity: oi.quantity,
          unit_price: item.price,
          total_price: item.price * oi.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('food_order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      toast.success('Order created');

      // Send payment notification for food order (non-blocking)
      if (orderCustomer) {
        // Extract phone from customer name if provided in format "Name - Phone"
        const phoneMatch = orderCustomer.match(/(\d{11})/);
        if (phoneMatch) {
          supabase.functions.invoke('food-payment-notify', {
            body: {
              order_id: orderData.id,
              order_number: orderNumber,
              customer_name: orderCustomer.split('-')[0].trim(),
              customer_phone: phoneMatch[1],
              total: total,
              payment_type: orderPaymentType
            }
          }).catch(err => console.log('Food notification sent in background'));
        }
      }

      setOrderDialogOpen(false);
      setOrderItems([]);
      setOrderCustomer('');
      fetchOrders();
    } catch (err) {
      console.error('[Food] Order error:', err);
      toast.error('Order failed');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'served' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('food_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const addItemToOrder = (itemId: string) => {
    const existing = orderItems.find(oi => oi.itemId === itemId);
    if (existing) {
      setOrderItems(prev => prev.map(oi => 
        oi.itemId === itemId ? {...oi, quantity: oi.quantity + 1} : oi
      ));
    } else {
      setOrderItems(prev => [...prev, { itemId, quantity: 1 }]);
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(oi => oi.itemId !== itemId));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drinks': return <Coffee className="w-4 h-4" />;
      case 'meals': return <Sandwich className="w-4 h-4" />;
      default: return <UtensilsCrossed className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">{'Pending'}</Badge>;
      case 'served':
        return <Badge className="bg-green-500/10 text-green-600">{'Served'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{'Cancelled'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const availableItems = foodItems.filter(i => i.is_available);
  const orderTotal = orderItems.reduce((sum, oi) => {
    const item = foodItems.find(f => f.id === oi.itemId);
    return sum + (item?.price || 0) * oi.quantity;
  }, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6" />
            {'Food Sales'}
          </h1>
          <p className="text-muted-foreground">
            {'Manage food & snacks'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Total Items'}</CardDescription>
            <CardTitle className="text-2xl">{foodItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{'Available'}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{availableItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{"Today's Orders"}</CardDescription>
            <CardTitle className="text-2xl">{orders.filter(o => 
              format(new Date(o.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            ).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">{'Items'}</TabsTrigger>
          <TabsTrigger value="orders">{'Orders'}</TabsTrigger>
        </TabsList>

        {/* Food Items Tab */}
        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{'Food Items'}</CardTitle>
                <Dialog open={itemDialogOpen} onOpenChange={(open) => {
                  setItemDialogOpen(open);
                  if (!open) {
                    setEditingItem(null);
                    setNewItem({ name: '', name_bn: '', category: 'snacks', price: 0, is_available: true });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {'Add Item'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem 
                          ? ('Edit Item')
                          : ('New Item')
                        }
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{'Name'}</Label>
                        <Input
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{'Category'}</Label>
                          <Select value={newItem.category} onValueChange={(v: any) => setNewItem({...newItem, category: v})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="snacks">{'Snacks'}</SelectItem>
                              <SelectItem value="drinks">{'Drinks'}</SelectItem>
                              <SelectItem value="meals">{'Meals'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{'Price (৳)'}</Label>
                          <Input
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newItem.is_available}
                          onCheckedChange={(checked) => setNewItem({...newItem, is_available: checked})}
                        />
                        <Label>{'Available'}</Label>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                        {'Cancel'}
                      </Button>
                      <Button onClick={handleSaveItem} disabled={savingItem}>
                        {savingItem && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {'Save'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Item'}</TableHead>
                      <TableHead>{'Category'}</TableHead>
                      <TableHead>{'Price'}</TableHead>
                      <TableHead>{'Status'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {[1,2,3,4].map(i => <TableRowSkeleton key={i} />)}
                  </tbody>
                </Table>
              ) : foodItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{'No items yet'}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Item'}</TableHead>
                      <TableHead>{'Category'}</TableHead>
                      <TableHead>{'Price'}</TableHead>
                      <TableHead>{'Available'}</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foodItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">৳{item.price}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{'Orders'}</CardTitle>
                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {'New Order'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{'New Order'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{'Customer Name'}</Label>
                        <Input
                          value={orderCustomer}
                          onChange={(e) => setOrderCustomer(e.target.value)}
                          placeholder={'Optional'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>{'Select Items'}</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {availableItems.map(item => (
                            <Button
                              key={item.id}
                              variant="outline"
                              size="sm"
                              className="justify-start"
                              onClick={() => addItemToOrder(item.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {item.name} - ৳{item.price}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {orderItems.length > 0 && (
                        <div className="space-y-2">
                          <Label>{'Order Items'}</Label>
                          <div className="space-y-2 p-3 bg-muted rounded-lg">
                            {orderItems.map(oi => {
                              const item = foodItems.find(f => f.id === oi.itemId);
                              if (!item) return null;
                              return (
                                <div key={oi.itemId} className="flex items-center justify-between">
                                  <span>{item.name} x{oi.quantity}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">৳{item.price * oi.quantity}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItemFromOrder(oi.itemId)}>
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="pt-2 border-t flex justify-between font-bold">
                              <span>{'Total'}</span>
                              <span>৳{orderTotal}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>{'Payment'}</Label>
                        <Select value={orderPaymentType} onValueChange={(v: any) => setOrderPaymentType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">{'Cash'}</SelectItem>
                            <SelectItem value="pending">{'Later'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                        {'Cancel'}
                      </Button>
                      <Button onClick={handleCreateOrder} disabled={creatingOrder || orderItems.length === 0}>
                        {creatingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {'Create Order'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Order #'}</TableHead>
                      <TableHead>{'Customer'}</TableHead>
                      <TableHead>{'Total'}</TableHead>
                      <TableHead>{'Status'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {[1,2,3].map(i => <TableRowSkeleton key={i} />)}
                  </tbody>
                </Table>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{'No orders yet'}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Order #'}</TableHead>
                      <TableHead>{'Customer'}</TableHead>
                      <TableHead>{'Total'}</TableHead>
                      <TableHead>{'Payment'}</TableHead>
                      <TableHead>{'Status'}</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                        <TableCell>{order.customer_name || '-'}</TableCell>
                        <TableCell className="font-medium">৳{order.total}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{order.payment_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          {order.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, 'served')}>
                                <Check className="w-3 h-3 mr-1" />
                                {'Served'}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
