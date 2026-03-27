import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingCart, UtensilsCrossed, CheckCircle, XCircle, Search, Percent, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { printFoodReceipt } from '@/lib/printFoodReceipt';
import type { Tables } from '@/integrations/supabase/types';

type FoodItem = Tables<'food_items'>;

interface CartItem {
  food_item: FoodItem;
  quantity: number;
}

export default function AdminFoodPOS() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'online' | 'pending'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Discount state
  const [discountMode, setDiscountMode] = useState<'none' | 'manual' | 'coupon'>('none');
  const [manualDiscountType, setManualDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch food items
  const { data: foodItems = [] } = useQuery({
    queryKey: ['food-items-pos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_available', true)
        .order('name');
      if (error) throw error;
      return data as FoodItem[];
    },
  });

  // Fetch today's orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['food-orders-today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_orders')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // Update order status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'served' | 'cancelled' }) => {
      const { error } = await supabase.from('food_orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-orders-today'] });
      toast.success('অর্ডার আপডেট হয়েছে');
    },
  });

  const cartSubtotal = useMemo(() => cart.reduce((sum, c) => sum + c.food_item.price * c.quantity, 0), [cart]);

  const discountAmount = useMemo(() => {
    if (discountMode === 'manual' && manualDiscountValue) {
      const val = parseFloat(manualDiscountValue);
      if (isNaN(val) || val <= 0) return 0;
      if (manualDiscountType === 'percentage') return Math.min(Math.round(cartSubtotal * val / 100), cartSubtotal);
      return Math.min(val, cartSubtotal);
    }
    if (discountMode === 'coupon' && appliedCoupon) {
      if (appliedCoupon.discount_type === 'percentage') return Math.min(Math.round(cartSubtotal * appliedCoupon.discount_value / 100), cartSubtotal);
      return Math.min(appliedCoupon.discount_value, cartSubtotal);
    }
    return 0;
  }, [cartSubtotal, discountMode, manualDiscountType, manualDiscountValue, appliedCoupon]);

  const cartTotal = cartSubtotal - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      if (error || !data) { toast.error('কুপন কোড সঠিক নয়!'); return; }
      if (data.valid_till && new Date(data.valid_till) < new Date()) { toast.error('কুপন মেয়াদ উত্তীর্ণ!'); return; }
      if (data.max_uses && data.used_count >= data.max_uses) { toast.error('কুপন সীমা শেষ!'); return; }
      if (data.min_order_amount && cartSubtotal < Number(data.min_order_amount)) { toast.error(`ন্যূনতম অর্ডার ৳${data.min_order_amount} হতে হবে!`); return; }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: Number(data.discount_value) });
      toast.success(`কুপন "${data.code}" প্রয়োগ হয়েছে!`);
    } catch { toast.error('কুপন চেক ব্যর্থ'); } finally { setCouponLoading(false); }
  };

  const clearDiscount = () => {
    setDiscountMode('none');
    setManualDiscountValue('');
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.food_item.id === item.id);
      if (existing) {
        return prev.map(c => c.food_item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { food_item: item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.food_item.id !== itemId) return c;
      const newQty = c.quantity + delta;
      return newQty < 1 ? c : { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.food_item.id !== itemId));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) { toast.error('কার্ট খালি!'); return; }
    setSubmitting(true);
    try {
      const orderNumber = `FO${Date.now().toString(36).toUpperCase()}`;
      const receiptItems = cart.map(c => ({
        name: c.food_item.name,
        quantity: c.quantity,
        unitPrice: c.food_item.price,
        totalPrice: c.food_item.price * c.quantity,
      }));
      const currentTotal = cartTotal;
      const currentSubtotal = cartSubtotal;
      const currentDiscount = discountAmount;
      const currentCustomer = customerName;
      const currentPayment = paymentType;
      const currentCouponCode = appliedCoupon?.code || null;
      const currentDiscountType = discountMode === 'manual' ? manualDiscountType : (appliedCoupon?.discount_type || null);

      const { data: order, error: orderError } = await supabase
        .from('food_orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerName || null,
          payment_type: paymentType,
          subtotal: currentSubtotal,
          total: currentTotal,
          discount_amount: currentDiscount,
          discount_type: currentDiscountType,
          coupon_code: currentCouponCode,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const items = cart.map(c => ({
        order_id: order.id,
        food_item_id: c.food_item.id,
        quantity: c.quantity,
        unit_price: c.food_item.price,
        total_price: c.food_item.price * c.quantity,
      }));
      const { error: itemsError } = await supabase.from('food_order_items').insert(items);
      if (itemsError) throw itemsError;

      // Play success sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {}

      // Increment coupon used_count
      if (currentCouponCode) {
        const { data: couponData } = await supabase.from('coupons').select('used_count').eq('code', currentCouponCode).single();
        if (couponData) {
          await supabase.from('coupons').update({ used_count: (couponData.used_count || 0) + 1 }).eq('code', currentCouponCode);
        }
      }

      toast.success(`অর্ডার #${orderNumber} তৈরি হয়েছে!`);
      setCart([]);
      setCustomerName('');
      setNotes('');
      setPaymentType('cash');
      clearDiscount();
      queryClient.invalidateQueries({ queryKey: ['food-orders-today'] });

      // Auto print receipt
      printFoodReceipt({
        orderNumber,
        items: receiptItems,
        subtotal: currentSubtotal,
        discount: currentDiscount,
        total: currentTotal,
        customerName: currentCustomer,
        paymentType: currentPayment,
      });
    } catch (err: any) {
      toast.error(err.message || 'অর্ডার তৈরি ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };


  // Keyboard shortcuts: Enter = place order, Escape = clear cart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }
      if (e.key === 'Enter' && cart.length > 0 && !submitting) {
        e.preventDefault();
        handlePlaceOrder();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (cart.length > 0) {
          setCart([]);
          setCustomerName('');
          setNotes('');
          setPaymentType('cash');
          toast.info('কার্ট ক্লিয়ার হয়েছে');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cart, submitting]);

  const categories = ['all', 'snacks', 'drinks', 'meals'] as const;

  const filteredBySearch = (items: FoodItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || (i.name_bn && i.name_bn.includes(q)));
  };

  const getItemsByCategory = (cat: string) => {
    const byCategory = cat === 'all' ? foodItems : foodItems.filter(i => i.category === cat);
    return filteredBySearch(byCategory);
  };

  const getCartQty = (itemId: string) => cart.find(c => c.food_item.id === itemId)?.quantity || 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-[calc(100vh-1rem)] gap-0 overflow-hidden">
      {/* Left Panel — Menu */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <h1 className="text-xl font-bold flex items-center gap-2 shrink-0">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Food POS
          </h1>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col px-4 overflow-hidden">
          <TabsList className="w-full justify-start mb-3">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All' : cat} ({getItemsByCategory(cat).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="flex-1 overflow-y-auto pb-4 mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {getItemsByCategory(cat).map(item => {
                  const qty = getCartQty(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className={cn(
                        "relative flex flex-col items-center rounded-xl border-2 p-3 transition-all hover:shadow-md active:scale-95",
                        qty > 0
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      {qty > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {qty}
                        </Badge>
                      )}
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover mb-2" />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center mb-2">
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-center leading-tight line-clamp-2">{item.name}</span>
                      <span className="text-primary font-bold text-sm mt-1">৳{item.price}</span>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Right Panel — Cart & Checkout */}
      <div className="w-full lg:w-[380px] flex flex-col bg-card border-t lg:border-t-0 overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({cart.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">আইটেম যোগ করুন</p>
          ) : (
            cart.map(c => (
              <div key={c.food_item.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.food_item.name}</p>
                  <p className="text-xs text-muted-foreground">৳{c.food_item.price} × {c.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.food_item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{c.quantity}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.food_item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(c.food_item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-sm font-bold w-14 text-right">৳{c.food_item.price * c.quantity}</span>
              </div>
            ))
          )}
        </div>

        {/* Checkout */}
        <div className="border-t border-border px-4 py-3 space-y-3">
          <Input
            placeholder="Customer Name (optional)"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="h-9"
          />
          <div className="flex gap-2">
            {(['cash', 'online', 'pending'] as const).map(pt => (
              <Button
                key={pt}
                size="sm"
                variant={paymentType === pt ? 'default' : 'outline'}
                onClick={() => setPaymentType(pt)}
                className="flex-1 capitalize text-xs"
              >
                {pt === 'pending' ? 'Due' : pt}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="h-9"
          />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">৳{cartTotal}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || submitting}
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>

        {/* Recent Orders */}
        <div className="border-t border-border px-4 py-2 max-h-48 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Today's Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">কোনো অর্ডার নেই</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="font-mono text-xs flex-1 truncate">{order.order_number}</span>
                  <Badge variant={order.status === 'served' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
                    {order.status}
                  </Badge>
                  <span className="text-xs font-medium">৳{order.total}</span>
                  {order.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => updateStatus.mutate({ id: order.id, status: 'served' })}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
