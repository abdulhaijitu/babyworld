

## Plan: Food POS System

### Overview
বর্তমান Food Orders পেজকে একটি পূর্ণাঙ্গ POS (Point of Sale) ইন্টারফেসে রূপান্তর করবো। এটি হবে একটি ডেডিকেটেড পেজ `/admin/food-pos` যেখানে স্টাফরা দ্রুত অর্ডার নিতে পারবে।

### POS Layout (2-Column)

```text
┌──────────────────────────────┬──────────────────────┐
│  MENU ITEMS                  │  CART / ORDER         │
│  ┌─────────────────────────┐ │                      │
│  │ [Snacks] [Drinks] [Meals]│ │  Customer: ________  │
│  └─────────────────────────┘ │                      │
│  ┌─────┐ ┌─────┐ ┌─────┐   │  ┌──────────────────┐ │
│  │ 🍕  │ │ 🍔  │ │ 🌭  │   │  │ Item    Qty  ৳   │ │
│  │Burger│ │Fries │ │HotDog│  │  │ Burger  2   160  │ │
│  │ ৳80 │ │ ৳50 │ │ ৳60 │   │  │ Fries   1    50  │ │
│  └──+──┘ └──+──┘ └──+──┘   │  │ [- qty +] [del]  │ │
│  ┌─────┐ ┌─────┐           │  └──────────────────┘ │
│  │ 🥤  │ │ 🧃  │           │                      │
│  │Cola │ │Juice│            │  Payment: [Cash][Due] │
│  │ ৳30 │ │ ৳40 │           │  Notes: ____________  │
│  └──+──┘ └──+──┘           │                      │
│                              │  ═══════════════════  │
│                              │  TOTAL: ৳210         │
│                              │  [  Place Order  ]    │
│                              │                      │
│                              │  ── Recent Orders ──  │
│                              │  FO240520ABC Pending  │
│                              │  FO240520DEF Served   │
└──────────────────────────────┴──────────────────────┘
```

### Features
1. **Left Panel — Menu Grid**: ক্যাটাগরি ট্যাব (All/Snacks/Drinks/Meals), বড় ক্লিকেবল কার্ড (ছবি, নাম, দাম), ট্যাপ করলেই কার্টে যোগ
2. **Right Panel — Cart & Checkout**: কার্ট আইটেম লিস্ট (+/- কোয়ান্টিটি), কাস্টমার নাম, পেমেন্ট টাইপ, নোটস, টোটাল ও Place Order বাটন
3. **Recent Orders**: রাইট প্যানেলের নিচে আজকের সাম্প্রতিক অর্ডার (স্ট্যাটাস সহ), ক্লিকে Serve/Cancel করা যাবে
4. **Quick Actions**: অর্ডার সাবমিটের পর অটো-রিসেট, সাউন্ড/টোস্ট নোটিফিকেশন
5. **Full-screen feel**: No page header clutter, compact layout optimized for touch/counter use

### Technical Details

**New file**: `src/pages/admin/AdminFoodPOS.tsx`
- Dedicated POS component, separate from existing AdminFoodOrders (which stays as order history/management)
- Reuses existing `food_items`, `food_orders`, `food_order_items` tables — no DB changes needed
- Uses existing cart logic (addToCart, updateCartQty, removeFromCart, handleCreateOrder)

**Route addition** in `App.tsx`:
- `<Route path="food-pos" element={<AdminFoodPOS />} />`

**Sidebar update** in `AdminSidebar.tsx`:
- Foods সাবমেনুতে "POS" আইটেম যোগ → `/admin/food-pos`

**No database migrations needed** — existing tables and RLS policies sufficient.

### File Changes Summary
| File | Change |
|------|--------|
| `src/pages/admin/AdminFoodPOS.tsx` | New — Full POS interface |
| `src/App.tsx` | Add `/admin/food-pos` route |
| `src/components/admin/AdminSidebar.tsx` | Add POS link under Foods menu |

